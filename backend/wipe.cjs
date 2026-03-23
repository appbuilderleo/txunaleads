const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  Empresa: String,
  Morada: String,
  Telefone: String,
  Website: String,
  Score: Number,
  Potencial: String,
  Rating: Number,
  Reviews: Number,
  ReviewSnippet: String,
  scannedAt: Date,
  userId: mongoose.Schema.Types.ObjectId
});

const LeadModel = mongoose.model('Lead', LeadSchema);

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/txunaleads');
  const leads = await LeadModel.find({});
  let deleted = 0;
  for (const lead of leads) {
    if (lead.Telefone && lead.Telefone.length < 5) {
      await LeadModel.deleteOne({ _id: lead._id });
      deleted++;
    } else if (lead.Morada && lead.Morada.includes('\n')) {
      await LeadModel.deleteOne({ _id: lead._id });
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} corrupted leads.`);
  await mongoose.disconnect();
})();
