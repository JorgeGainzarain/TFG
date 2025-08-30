// frontend/src/services/libraryService.js
import {makeAuthenticatedRequest} from './api.js';

// Get user's libraries (no userId needed - extracted from token)
export const getUserLibraries = async (userId, params = {
    bookId: undefined,
    libraryTitle: undefined
}) => {
    try {
        let url = `/users/${userId}/libraries/`;
        const queryParams = [];
        if (params.bookId) queryParams.push(`bookId=${encodeURIComponent(params.bookId)}`);
        if (params.libraryTitle) queryParams.push(`libraryTitle=${encodeURIComponent(params.libraryTitle)}`);
        if (queryParams.length) url += `?${queryParams.join('&')}`;
        const response = await makeAuthenticatedRequest(url);

        return (await response.json()).data;
    } catch (error) {
        console.error('Error fetching user libraries:', error);
        throw error;
    }
};


export const addBookToLibrary = async (userId, book, libraryTitle) => {
    const libraries = await getUserLibraries(userId,{ libraryTitle: libraryTitle });
    console.log("Libraries found: ", libraries);
    const library = libraries[0];
    if (!library) {
        throw new Error(`Library with title "${libraryTitle}" not found.`);
    }
    try {
        return await makeAuthenticatedRequest(`/users/${userId}/libraries/${library.id}/books/`, {
            method: 'POST',
            body: JSON.stringify({
                book: book
            }),
        });
    } catch (error) {
        console.error('Error adding book to library:', error);
    }
};

export const removeBookFromLibrary = async (userId, book) => {
    try {
        const library = await getUserLibraries(userId, { bookId: book.bookId });
        const response = await makeAuthenticatedRequest(`users/${userId}/libraries/${library.id}/books/${book.bookId}`, {
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