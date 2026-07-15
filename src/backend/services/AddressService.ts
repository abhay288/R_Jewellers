import { AddressRepository } from '../repositories/AddressRepository';
import Address from '../models/Address';

export class AddressService {
  private repository: AddressRepository;

  constructor() {
    this.repository = new AddressRepository();
  }

  async getUserAddresses(userId: string) {
    return this.repository.find({ user: userId });
  }

  async createAddress(userId: string, addressData: any) {
    // If it's set as default, we need to unset any existing default for this user
    if (addressData.isDefault) {
      await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    }

    const addresses = await this.getUserAddresses(userId);
    // If it's the first address, make it default automatically
    if (addresses.length === 0) {
      addressData.isDefault = true;
    }

    return this.repository.create({ ...addressData, user: userId });
  }

  async updateAddress(userId: string, addressId: string, addressData: any) {
    const address = await this.repository.findById(addressId);
    if (!address || address.user.toString() !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    if (addressData.isDefault) {
      await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { $set: { isDefault: false } });
    }

    return this.repository.update(addressId, addressData);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.repository.findById(addressId);
    if (!address || address.user.toString() !== userId) {
      throw new Error("Address not found or unauthorized");
    }
    return this.repository.delete(addressId);
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.repository.findById(addressId);
    if (!address || address.user.toString() !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    return this.repository.update(addressId, { isDefault: true });
  }
}

