import api from './api';
import type { ChatMessage } from '@/types';

export const chatService = {
    async sendMessage(message: string): Promise<string> {
        const { data } = await api.post<{ response: string }>('/api/ai/chat', { message });
        return data.response;
    },
};

// Chat history stored in memory per session (browser localStorage for persistence)
export const chatHistoryService = {
    getHistory(): ChatMessage[] {
        const stored = localStorage.getItem('chat_history');
        return stored ? (JSON.parse(stored) as ChatMessage[]) : [];
    },

    addMessage(message: ChatMessage): void {
        const history = chatHistoryService.getHistory();
        history.push(message);
        // Keep last 50 messages
        const trimmed = history.slice(-50);
        localStorage.setItem('chat_history', JSON.stringify(trimmed));
    },

    clearHistory(): void {
        localStorage.removeItem('chat_history');
    },
};
