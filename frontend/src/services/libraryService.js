// frontend/src/services/libraryService.js
import { makeAuthenticatedRequest } from './api.js';

// Get user's libraries (no userId needed - extracted from token)
export const getUserLibraries = async (userId) => {
    try {
        const response = await makeAuthenticatedRequest(`/users/${userId}/libraries/`);

        const data = (await response.json()).data;
        return data;
    } catch (error) {
        console.error('Error fetching user libraries:', error);
        throw error;
    }
};


export const addBookToLibrary = async (userId, book, libraryId) => {
    try {
        return await makeAuthenticatedRequest(`/users/${userId}/libraries/`, {
            method: 'POST',
            body: JSON.stringify({
                title: libraryId,
                book: book
            }),
        });
    } catch (error) {
        console.error('Error adding book to library:', error);
    }
};

export const removeBookFromLibrary = async (book) => {
    try {
        const response = await makeAuthenticatedRequest(`/library/${book.bookId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication required. Please log in again.');
            }
            throw new Error(`Failed to remove book from library: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing book from library:', error);
        throw error;
    }
}