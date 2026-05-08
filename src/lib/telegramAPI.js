// Telegram Bot API wrapper for SelfDesk
// Routes all requests through Supabase Edge Function proxy
// because Telegram blocks browser user agents

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-proxy`;

/**
 * Call the Supabase Edge Function proxy for Telegram API
 */
async function callProxy(payload) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Proxy error: ${response.status}`);
  }

  return data;
}

/**
 * Send a text message to Telegram
 */
export async function sendMessage(botToken, chatId, text) {
  try {
    const result = await callProxy({
      botToken,
      method: 'sendMessage',
      body: {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      }
    });

    if (!result.ok) {
      throw new Error(result.description || 'Failed to send message');
    }

    return result;
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

/**
 * Send a document/file to Telegram
 */
export async function sendDocument(botToken, chatId, file) {
  try {
    // Read file as base64 for proxy transmission
    const fileBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const result = await callProxy({
      botToken,
      method: 'sendDocument',
      body: {
        chat_id: chatId,
        document: fileBase64,
        filename: file.name,
        mime_type: file.type,
      }
    });

    if (!result.ok) {
      throw new Error(result.description || 'Failed to send document');
    }

    return result;
  } catch (error) {
    console.error('Error sending document to Telegram:', error);
    throw new Error(`Failed to send document: ${error.message}`);
  }
}

/**
 * Get file information from Telegram
 */
export async function getFile(botToken, fileId) {
  try {
    const result = await callProxy({
      botToken,
      method: 'getFile',
      fileId
    });

    if (!result.ok) {
      throw new Error(result.description || 'Failed to get file info');
    }

    return result.result;
  } catch (error) {
    console.error('Error getting file info from Telegram:', error);
    throw new Error(`Failed to get file info: ${error.message}`);
  }
}

/**
 * Delete a message from Telegram
 */
export async function deleteMessage(botToken, chatId, messageId) {
  try {
    const result = await callProxy({
      botToken,
      method: 'deleteMessage',
      body: {
        chat_id: chatId,
        message_id: messageId
      }
    });

    if (!result.ok) {
      throw new Error(result.description || 'Failed to delete message');
    }

    return result;
  } catch (error) {
    console.error('Error deleting message from Telegram:', error);
    throw new Error(`Failed to delete message: ${error.message}`);
  }
}

/**
 * Download file content from Telegram
 */
export async function downloadFile(botToken, filePath) {
  try {
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        botToken,
        method: 'downloadFile',
        fileId: filePath,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to download file');
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading file from Telegram:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Download file directly using file_id (combines getFile + downloadFile)
 */
export async function downloadFileById(botToken, fileId) {
  try {
    const fileInfo = await getFile(botToken, fileId);
    return await downloadFile(botToken, fileInfo.file_path);
  } catch (error) {
    console.error('Error downloading file by ID from Telegram:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Get complete file download URL (through proxy)
 */
export function getFileDownloadUrl(botToken, filePath) {
  // Return proxy URL for file download
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return `${supabaseUrl}/functions/v1/telegram-proxy?botToken=${encodeURIComponent(botToken)}&method=downloadFile&fileId=${encodeURIComponent(filePath)}&apikey=${supabaseKey}`;
}

/**
 * Handle Telegram API errors
 */
export function handleTelegramError(error) {
  return error.message || 'An unknown error occurred';
}
