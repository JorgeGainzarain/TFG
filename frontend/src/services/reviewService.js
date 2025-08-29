import {makeAuthenticatedRequest} from "./api";

export const getReviewsFromBook = async (book) => {
    try {
        const response = await makeAuthenticatedRequest(`/books/${book.bookId}/reviews`);
        return response.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
}

export const addReviewToBook = async (book, review) => {
    if (!review.createdAt) {
        review.createdAt = new Date().toISOString();
    }
    if (!review.likedBy) {
        review.likedBy = '';
    }
    review.book = book;
    try {
        const response = await makeAuthenticatedRequest(`/books/${book.bookId}/reviews/`, {
            method: 'POST',
            body: JSON.stringify(review),
        });
        return response;
    } catch (error) {
        console.error('Error adding review:', error);
        throw error;
    }
}

export const likeReview = async (userId, book, review) => {
    console.log("Review in likeReview: ", review);
    try {
        const response = await makeAuthenticatedRequest(`/books/${book.bookId}/reviews/${review.id}/likes/`, {
            method: 'POST'
        });
        return response.json();
    } catch (error) {
        console.error('Error liking review:', error);
    }
}

export const isLiked = async (userId, book, review) => {
    console.log("Review in isLiked: ", review);
    try {
        const response = await makeAuthenticatedRequest(`/books/${book.bookId}/reviews/${review.id}/likes/me`, {
            method: 'GET'
        });
        const data = await response.json();
        console.log("IsLiked data: ", data);
        return data;
    } catch (error) {
        console.error('Error checking if review is liked:', error);
    }
}

export const updateReview = async (userId, book, review) => {
    try {
        return await makeAuthenticatedRequest(`/books/${book.bookId}/reviews/${review.id}`, {
            method: 'PUT',
            body: JSON.stringify(review),
        });
    } catch (error) {
        console.error('Error updating review:', error);
    }
}

export const deleteReview = async (book, reviewId) => {
    try {
        return await makeAuthenticatedRequest(`/books/${book.bookId}/reviews/${reviewId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error deleting review:', error);
    }
}
