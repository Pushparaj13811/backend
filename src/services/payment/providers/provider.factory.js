import { RazorpayProvider } from './razorpay.provider.js';

export class PaymentProviderFactory {
  static providers = {
    razorpay: RazorpayProvider
  };

  static getProvider(providerName, config) {
    const ProviderClass = this.providers[providerName];
    if (!ProviderClass) {
      throw new Error(`Payment provider '${providerName}' not supported`);
    }
    return new ProviderClass(config);
  }

  static registerProvider(name, providerClass) {
    if (this.providers[name]) {
      throw new Error(`Payment provider '${name}' is already registered`);
    }
    this.providers[name] = providerClass;
  }
} 