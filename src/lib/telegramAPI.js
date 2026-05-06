// Telegram Bot API wrapper for SelfDesk
import axios from 'axios';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Get bot token and chat ID from environment variables
 */
function getTelegramConfig() {
  const botToken = import.meta.env.VITE_BOT_TOKEN;
  const chatId = import.meta.env.VITE_CHAT_ID;
  
  if (!botToken || !chatId) {
    throw new Error('Missing Telegram environment variables. Please check your .env file.');
  }
  
  return { botToken, chatId };
}

/**
 * Send a text message to Telegram
 * @param {string} text - Message content
 * @returns {Promise<Object>} - Telegram API response
 */
export async function sendMessage(text) {
  const { botToken, chatId } = getTelegramConfig();
  
  try {
    const response = await axios.post(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    throw new Error(`Failed to send message: ${error.response?.data?.description || error.message}`);
  }
}

/**
 * Send a document/file to Telegram
 * @param {File} file - File object to upload
 * @returns {Promise<Object>} - Telegram API response with file_id
 */
export async function sendDocument(file) {
  const { botToken, chatId } = getTelegramConfig();
  
  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', file);
    
    const response = await axios.post(`${TELEGRAM_API_BASE}${botToken}/sendDocument`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending document to Telegram:', error);
    throw new Error(`Failed to send document: ${error.response?.data?.description || error.message}`);
  }
}

/**
 * Get file information from Telegram
 * @param {string} fileId - Telegram file_id
 * @returns {Promise<Object>} - File information including file_path
 */
export async function getFile(fileId) {
  const { botToken } = getTelegramConfig();
  
  try {
    const response = await axios.post(`${TELEGRAM_API_BASE}${botToken}/getFile`, {
      file_id: fileId
    });
    
    return response.data.result;
  } catch (error) {
    console.error('Error getting file info from Telegram:', error);
    throw new Error(`Failed to get file info: ${error.response?.data?.description || error.message}`);
  }
}

/**
 * Download file content from Telegram
 * @param {string} filePath - File path from getFile response
 * @returns {Promise<Blob>} - File content as blob
 */
export async function downloadFile(filePath) {
  const { botToken } = getTelegramConfig();
  
  try {
    const response = await axios.get(`${TELEGRAM_API_BASE}${botToken}/file/${filePath}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading file from Telegram:', error);
    throw new Error(`Failed to download file: ${error.response?.data?.description || error.message}`);
  }
}

/**
 * Get complete file download URL
 * @param {string} filePath - File path from getFile response
 * @returns {string} - Direct download URL
 */
export function getFileDownloadUrl(filePath) {
  const { botToken } = getTelegramConfig();
  return `${TELEGRAM_API_BASE}${botToken}/file/${filePath}`;
}

/**
 * Handle Telegram API errors
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message
 */
export function handleTelegramError(error) {
  if (error.response?.data?.description) {
    return error.response.data.description;
  }
  return error.message || 'An unknown error occurred';
}
