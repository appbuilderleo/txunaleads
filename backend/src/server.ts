import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { scanGoogleMaps } from './scraper.js';
import User from './models/User.js';
import LeadModel from './models/Lead.js';
import Payment from './models/Payment.js';
import type { Lead } from './scraper.js';
import axios from 'axios';


// Forçar DNS do Google para resolver SRV records do MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-txunaleads-2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/txunaleads';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    const dbType = MONGO_URI.includes('localhost') ? 'Local' : 'ATLAS (Cloud)';
    console.log(`✅ 🛡️ @cto: MONGODB CONECTADO [${dbType}]`);
    
    // Debug: Verificar se as collections estão acessíveis
    console.log('📊 @cto: Sincronizando modelos...');
    try {
      const duplicates = await LeadModel.aggregate([
        { $group: { 
          _id: { Empresa: "$Empresa", userId: "$userId" },
          ids: { $push: "$_id" },
          count: { $sum: 1 }
        }},
        { $match: { count: { $gt: 1 } } }
      ]);
      
      if (duplicates.length > 0) {
        let removedCount = 0;
        for (const dup of duplicates) {
          // Manter o primeiro (mais antigo), remover os restantes
          const idsToRemove = dup.ids.slice(1);
          await LeadModel.deleteMany({ _id: { $in: idsToRemove } });
          removedCount += idsToRemove.length;
        }
        console.log(`🧹 @cto: ${removedCount} leads duplicados removidos do banco.`);
      } else {
        console.log('✅ @cto: Banco limpo, sem duplicados.');
      }
    } catch (cleanErr) {
      console.warn('⚠️ Erro na limpeza de duplicados:', cleanErr);
    }
  })
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Middleware de Autenticação
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user; // user.id e user.role estão aqui
    next();
  });
};

const isAdmin = async (req: any, res: any, next: any) => {
  const user = await User.findById(req.user.id);
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
};

/**
 * AUTH: REGISTRO
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, company, password, plan } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está registado.' });
    }

    const newUser = new User({ name, email, company, password, plan });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      user: { id: newUser._id, name, email, plan: newUser.plan, role: newUser.role },
      token
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar conta.' });
  }
});

/**
 * AUTH: LOGIN
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user: any = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email, plan: user.plan, role: user.role },
      token
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro ao entrar no sistema.' });
  }
});

/**
 * PAYMENTS: CHECKOUT (Integração PaySuite)
 */
app.post('/api/payments/checkout', authenticateToken, async (req: any, res) => {
  try {
    const { plan, amount, method, phoneNumber } = req.body;
    const userId = req.user.id;
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Criar Pagamento Pendente Localmente
    const payment = new Payment({
      userId,
      plan,
      amount,
      method,
      phoneNumber,
      transactionId,
      status: 'pending'
    });
    await payment.save();

    // Mapear metodos para a PaySuite
    let payMethod = 'mpesa';
    if (method === 'E-MOLA') payMethod = 'emola';
    if (method === 'CARD') payMethod = 'credit_card';

    // Chama a API da PaySuite
    const paySuitePayload: any = {
      amount: amount.toString(),
      reference: transactionId,
      description: `Pagamento do plano ${plan}`,
      return_url: `${FRONTEND_URL}/dashboard`,
      callback_url: `${BACKEND_URL}/api/payments/paysuite/webhook`,
      cancel_url: `${FRONTEND_URL}/dashboard`,
      fallback_url: `${FRONTEND_URL}/dashboard`
    };

    const token = process.env.PAYSUITE_TOKEN;
    
    if (!token) {
        console.error('❌ PAYSUITE_TOKEN não configurado no .env');
        return res.status(500).json({ error: 'Erro de configuração no gateway de pagamento.' });
    }

    // NOTE: Utilizando a URL base correta documentada https://paysuite.tech/api/v1/payments
    const response = await axios.post('https://paysuite.tech/api/v1/payments', paySuitePayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.data && response.data.status === 'success') {
       return res.json({
         success: true,
         message: 'Redirecionando para o gateway de pagamento...',
         checkout_url: response.data.data.checkout_url
       });
    }

    return res.status(400).json({ error: 'Erro ao criar pagamento na PaySuite.' });

  } catch (error: any) {
    console.error('❌ Erro no checkout:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao processar pagamento.' });
  }
});

/**
 * PAYSUITE WEBHOOK
 */
app.post('/api/payments/paysuite/webhook', express.json(), async (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (event === 'payment.success') {
      const { reference } = data;
      const payment = await Payment.findOneAndUpdate({ transactionId: reference }, { status: 'completed' }, { new: true });
      if (payment) {
        // Upgrade de Plano
        await User.findByIdAndUpdate(payment.userId, { plan: payment.plan });
        console.log(`✅ Webhook: Plano atualizado para ${payment.plan} (User: ${payment.userId})`);
      }
    } else if (event === 'payment.failed') {
      const { reference } = data;
      await Payment.findOneAndUpdate({ transactionId: reference }, { status: 'failed' });
      console.log(`❌ Webhook: Pagamento falhou. Ref: ${reference}`);
    }

    res.status(200).json({ received: true });
  } catch(error) {
    console.error('Erro no processamento do webhook:', error);
    res.status(500).json({ error: 'Erro interno no webhook' });
  }
});

/**
 * AUTH: ME (Get current user data to sync plan updates)
 */
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, plan: user.plan, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * LEADS: LISTAR LEADS DO USUÁRIO
 */
app.get('/api/leads', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const leads = await LeadModel.find({ userId }).sort({ scannedAt: -1 });
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar seus leads.' });
  }
});

/**
 * SCRAPER: VARREDURA DE LEADS (Google Maps)
 */
app.post('/api/scan', authenticateToken, async (req: any, res) => {
  try {
    const { query, location } = req.body;
    const userId = req.user.id;

    if (!query || !location) {
      return res.status(400).json({ error: 'Nicho e localização são obrigatórios.' });
    }

    const searchQuery = `${query} em ${location}`;
    console.log(`📡 @cto: Varredura Google Maps (User: ${userId}) para: ${searchQuery}`);

    const leads: Lead[] = await scanGoogleMaps(searchQuery);

    // Salvar no Banco de Dados (com deduplicação!)
    let newCount = 0;
    let updatedCount = 0;
    
    try {
      if (leads.length > 0) {
        const operations = leads.map(l => ({
          updateOne: {
            filter: { Empresa: l.Empresa, userId: userId },  // Chave de deduplicação
            update: { 
              $set: {
                ...l,
                scannedAt: new Date(),
                userId: userId
              }
            },
            upsert: true  // Se não existe, cria. Se existe, atualiza.
          }
        }));

        const result = await LeadModel.bulkWrite(operations, { ordered: false });
        newCount = result.upsertedCount || 0;
        updatedCount = result.modifiedCount || 0;
        
        console.log(`📊 @cto: ${newCount} novos leads salvos, ${updatedCount} atualizados.`);
      }
    } catch (dbErr) {
      console.warn('⚠️ @cto: Erro parcial na gravação:', dbErr);
    }
    
    res.json({
      success: true,
      data: leads,
      count: leads.length,
      newLeads: newCount,
      updatedLeads: updatedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no processamento da API:', error);
    res.status(500).json({ error: 'Falha interna na varredura dos leads.' });
  }
});

/**
 * CRM: ATUALIZAR STATUS DO LEAD
 */
app.patch('/api/leads/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['novo', 'contactado', 'reuniao', 'recusado', 'fechado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const updatedLead = await LeadModel.findOneAndUpdate(
      { _id: id, userId: userId },
      { $set: { status } },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    res.json({ success: true, data: updatedLead });
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

/**
 * ADMIN: ESTATÍSTICAS GLOBAIS
 */
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLeads = await LeadModel.countDocuments();
    const planCounts = await User.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } }
    ]);
    
    // Estimativa de receita simplificada em MT
    let revenue = 0;
    planCounts.forEach(p => {
      if (p._id === 'Empreendedor') revenue += p.count * 267;
      if (p._id === 'Agência') revenue += p.count * 2530;
    });

    // Atividade de Prospecção (Últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    interface DailyStats {
      _id: string; // YYYY-MM-DD
      count: number;
    }

    const activityData: DailyStats[] = await LeadModel.aggregate([
      { $match: { scannedAt: { $gte: sevenDaysAgo } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$scannedAt" } },
          count: { $sum: 1 } 
      } },
      { $sort: { _id: 1 } }
    ]);

    // Preencher dias sem atividade (Zeros)
    const last7Days: { date: string, count: number, label: string }[] = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const match = activityData.find(a => a._id === isoDate);
      last7Days.push({
        date: isoDate,
        count: match ? match.count : 0,
        label: weekdays[d.getDay()]
      });
    }

    res.json({
      success: true,
      data: { 
        totalUsers, 
        totalLeads, 
        planCounts, 
        estimatedRevenue: revenue,
        dailyActivity: last7Days 
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

/**
 * ADMIN: LISTAR E GERIR UTILIZADORES
 */
app.get('/api/admin/users', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    // Enriquecer com contagem de leads de cada user
    const usersWithLeads = await Promise.all(users.map(async (u: any) => {
      const leadCount = await LeadModel.countDocuments({ userId: u._id });
      return { ...u._doc, leadCount };
    }));

    res.json({ success: true, data: usersWithLeads });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar utilizadores.' });
  }
});

app.patch('/api/admin/users/:id/plan', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(id, { plan }, { new: true });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar plano.' });
  }
});

app.patch('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cargo.' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    // Opcional: Remover também os leads do utilizador
    await LeadModel.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Utilizador e seus dados removidos com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar utilizador.' });
  }
});



// Inicialização
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`\n✅ 🛡️ @cto: SERVIDOR TXUNALEADS ONLINE`);
  console.log(`🔗 Endereço: http://0.0.0.0:${PORT}`);
  console.log(`🚀 Status: Operacional e Pronto no Render\n`);
});
