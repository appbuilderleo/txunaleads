const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/txunaleads';

const userSchema = new mongoose.Schema({
  email: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function makeAdmin(email) {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (user) {
      console.log(`✅ @cto: O utilizador ${email} agora é ADMINISTRADOR.`);
    } else {
      console.log(`❌ @cto: Utilizador com email ${email} não encontrado.`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Uso: node makeAdmin.cjs <email>');
} else {
  makeAdmin(email);
}
