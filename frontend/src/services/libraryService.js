// frontend/src/services/libraryService.js
import { makeAuthenticatedRequest } from './authService.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get user's libraries (no userId needed - extracted from token)
export const getUserLibraries = async () => {
    try {
        const response = await makeAuthenticatedRequest('/library/');

        const data = (await response.json()).data;
        return data;
    } catch (error) {
        console.error('Error fetching user libraries:', error);
        throw error;
    }
};

// Create a new library (no userId needed - extracted from token)
export const createLibrary = async (libraryData) => {
    try {
        const response = await makeAuthenticatedRequest('/library/', {
            method: 'POST',
            body: JSON.stringify(libraryData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication required. Please log in again.');
            }
            throw new Error(`Failed to create library: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating library:', error);
        throw error;
    }
};

// Add book to user's library (no userId needed - extracted from token)
export const addBookToLibrary = async (bookId, bookData) => {
    try {
        const response = await makeAuthenticatedRequest(`/library/${bookId}`, {
            method: 'POST',
            body: JSON.stringify(bookData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication required. Please log in again.');
            }
            throw new Error(`Failed to add book to library: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding book to library:', error);
        throw error;
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