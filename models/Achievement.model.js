const mongoose = require('mongoose')
const Schema = mongoose.Schema

const achievementSchema = new Schema({
  title: { type: String, required: true },
  caption: { type: String },
  description: { type: String, required: true },
  pics_url: [String],
  documentIDs: { type: [[String]] },
  keywords: [String]
}, {
  timestamps: true
})

achievementSchema.statics.filterByRange = function (init, end) {
  return this.find({
    date: {
      $gte: init,
      $lte: end
    }
  })
}
const Achievements = mongoose.model('achievements', achievementSchema)

module.exports = Achievements
