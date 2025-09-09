import {apiRequest, makeAuthenticatedRequest} from './api';


export const bookAPI = {
    

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

export const getRecommendedBooks = async () => {
    try {
        const response = await makeAuthenticatedRequest('/books/recommendations', {
            method: 'GET',
        });

        const result = await response.json();

        return result.data || [];
    } catch (error) {
        console.error('Error fetching recommended books:', error);
    }
}