import {apiRequest, makeAuthenticatedRequest} from './api';

// Book API functions - estos endpoints necesitarán ser implementados en tu backend
export const bookAPI = {
    // Search books - este endpoint necesita ser implementado
// Accepts query, orderBy, maxResults, genre, year, etc.
    searchBooks: async (query, { orderBy, genre, year, page } = {}) => {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (orderBy) params.append('orderBy', orderBy);
        if (genre) params.append('category', genre);
        if (year) params.append('year', year);
        if (page) params.append('page', page);

        try {
            const response = await apiRequest(`/books/?${params.toString()}`);
            return response.data || [];
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    },

};

export const updateBook = async (book) => {
    try {
        return await makeAuthenticatedRequest(`/libraries/${book.bookId}`, {
            method: 'PUT',
            body: JSON.stringify(book),
        });
    } catch (error) {
        console.error('Error updating book:', error);
    }
}

export const getTrendingBooks = async () => {
    try {
        const response = await apiRequest('/books/trending', {
            method: 'GET',
        });

        return response;
    } catch (error) {
        console.error('Error fetching trending books:', error);
    }
}