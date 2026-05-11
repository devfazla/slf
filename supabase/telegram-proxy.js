// Supabase Edge Function: Telegram API Proxy
// This proxy is needed because Telegram blocks browser user agents.
// All Telegram API calls from the client go through this edge function.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { botToken, method, body, fileId } = await req.json();

        if (!botToken || !method) {
            return new Response(
                JSON.stringify({ error: "Missing botToken or method" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        let telegramUrl: string;
        let fetchOptions: RequestInit = {};

        // Route to the appropriate Telegram API method
        switch (method) {
            case "sendMessage":
                telegramUrl = `${TELEGRAM_API_BASE}${botToken}/sendMessage`;
                fetchOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                };
                break;

            case "sendDocument": {
                // Decode base64 file and send as multipart/form-data to Telegram
                telegramUrl = `${TELEGRAM_API_BASE}${botToken}/sendDocument`;

                const chatId = body.chat_id;
                const fileBase64 = body.document;
                const filename = body.filename || "file";
                const mimeType = body.mime_type || "application/octet-stream";

                // Decode base64 to binary
                const binaryString = atob(fileBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Create Blob from binary data
                const fileBlob = new Blob([bytes], { type: mimeType });

                // Build multipart/form-data manually
                const boundary = "----FormBoundary" + Math.random().toString(36).substring(2);
                const parts: Uint8Array[] = [];

                // Add chat_id field
                const chatIdPart = `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`;
                parts.push(new TextEncoder().encode(chatIdPart));

                // Add document field (file)
                const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
                parts.push(new TextEncoder().encode(fileHeader));
                parts.push(bytes);
                parts.push(new TextEncoder().encode("\r\n"));

                // Closing boundary
                parts.push(new TextEncoder().encode(`--${boundary}--\r\n`));

                // Combine all parts
                const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
                const combined = new Uint8Array(totalLength);
                let offset = 0;
                for (const part of parts) {
                    combined.set(part, offset);
                    offset += part.length;
                }

                fetchOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": `multipart/form-data; boundary=${boundary}`,
                    },
                    body: combined,
                };
                break;
            }

            case "getFile":
                telegramUrl = `${TELEGRAM_API_BASE}${botToken}/getFile`;
                fetchOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file_id: fileId }),
                };
                break;

            case "getUpdates":
                telegramUrl = `${TELEGRAM_API_BASE}${botToken}/getUpdates`;
                fetchOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                };
                break;

            case "deleteMessage":
                telegramUrl = `${TELEGRAM_API_BASE}${botToken}/deleteMessage`;
                fetchOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                };
                break;

            case "downloadFile":
                // fileId here is actually the file_path for download
                telegramUrl = `https://api.telegram.org/file/bot${botToken}/${fileId}`;
                fetchOptions = {
                    method: "GET",
                };
                break;

            default:
                return new Response(
                    JSON.stringify({ error: `Unknown method: ${method}` }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
        }

        // Forward the request to Telegram API
        const telegramResponse = await fetch(telegramUrl, fetchOptions);

        // For file downloads, return the blob directly
        if (method === "downloadFile") {
            const blob = await telegramResponse.blob();
            return new Response(blob, {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type": telegramResponse.headers.get("Content-Type") || "application/octet-stream",
                },
            });
        }

        // For other methods, return JSON response
        const data = await telegramResponse.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        console.error("Telegram proxy error:", message);
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
