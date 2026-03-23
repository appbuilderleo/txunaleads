import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  Empresa: { type: String, required: true },
  Morada: { type: String, required: false },
  Telefone: { type: String, required: false },
  Website: { type: String, required: false },
  Score: { type: Number, required: false },
  Potencial: { type: String, required: false },
  Rating: { type: Number, default: 0 },
  Reviews: { type: Number, default: 0 },
  ReviewSnippet: { type: String, default: "" },
  status: { type: String, enum: ['novo', 'contactado', 'reuniao', 'recusado', 'fechado'], default: 'novo' },
  scannedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Índice composto: mesma Empresa + mesmo Utilizador = não pode duplicar
LeadSchema.index({ Empresa: 1, userId: 1 }, { unique: true });

const LeadModel = mongoose.model('Lead', LeadSchema);
export default LeadModel;
