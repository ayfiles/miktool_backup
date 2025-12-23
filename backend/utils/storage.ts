import { mkdir, writeFile, access } from 'fs/promises';
import { join } from 'path';
import { Order } from "../types/order";

const STORAGE_DIR = join(__dirname, '../storage/orders');

/**
 * Checks if a directory exists
 */
async function directoryExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves an order to the filesystem
 * @param order - Validated order to save
 * @throws Error if orderId folder already exists
 */
export async function saveOrder(order: Order): Promise<void> {
  const orderDir = join(STORAGE_DIR, order.orderId);

  // Check if order already exists
  if (await directoryExists(orderDir)) {
    throw new Error('Order already exists');
  }

  // Create order directory
  await mkdir(orderDir, { recursive: true });

  // Save order.json
  const orderPath = join(orderDir, 'order.json');
  await writeFile(orderPath, JSON.stringify(order, null, 2), 'utf-8');
}




