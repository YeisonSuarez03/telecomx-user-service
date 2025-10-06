import { Kafka } from 'kafkajs';
import KafkaConfig from './KafkaConfig.js';

class KafkaAdapter {
  constructor() {
    if (KafkaAdapter.instance) return KafkaAdapter.instance;
    const broker = KafkaConfig.getBroker();
    this.kafka = new Kafka({ 
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: [broker] 
    });
    this.producer = this.kafka.producer();
    this._connected = false;
    KafkaAdapter.instance = this;
  }

  async connect() {
    if (!this._connected) {
      await this.producer.connect();
      this._connected = true;
      console.log('Kafka producer connected');
    }
  }

  async sendEvent(key, eventType, payload) {
    try {
      if (!this._connected) await this.connect();
      const topic = KafkaConfig.getTopic();
      const message = {
        key: String(key),
        value: JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() })
      };
      const producerReturnData = await this.producer.send({ topic, messages: [message] });

      console.log("Kafka sendEvent SUCCESS: ", {
        topic,
        message,
        producerReturnData
      });
    } catch (err) {
      console.error('Kafka sendEvent error:', err.message || err);
    }
  }
}

export default new KafkaAdapter();
