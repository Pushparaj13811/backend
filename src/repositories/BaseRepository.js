export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const entity = new this.model(data);
    return await entity.save();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(filter) {
    return await this.model.findOne(filter);
  }

  async find(filter = {}, options = {}) {
    return await this.model.find(filter, null, options);
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  async exists(filter) {
    return await this.model.exists(filter);
  }
} 