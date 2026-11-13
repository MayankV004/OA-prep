import { Schema, model, models, type Document } from 'mongoose';

export interface IProcessedWebhookEvent extends Document {
  eventId: string;
  provider: string;
  eventType: string;
  receivedAt: Date;
}

const processedWebhookEventSchema = new Schema<IProcessedWebhookEvent>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, required: true },
    eventType: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
  },
  { timestamps: true }
);

export const ProcessedWebhookEvent =
  models.ProcessedWebhookEvent ||
  model<IProcessedWebhookEvent>('ProcessedWebhookEvent', processedWebhookEventSchema, 'processed_webhook_events');
