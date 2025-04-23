import { PostgrestError } from '@supabase/supabase-js';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleDatabaseError(error: PostgrestError): AppError {
  let message = 'Une erreur est survenue';
  let status = 500;

  switch (error.code) {
    case '23505': // unique_violation
      message = 'Cette entrée existe déjà';
      status = 409;
      break;
    case '23503': // foreign_key_violation
      message = 'Référence invalide';
      status = 400;
      break;
    case '23502': // not_null_violation
      message = 'Données requises manquantes';
      status = 400;
      break;
    case '42P01': // undefined_table
      message = 'Erreur de configuration';
      status = 500;
      break;
    default:
      console.error('Database error:', error);
  }

  return new AppError(message, error.code, status, error.details);
}

export function handleAuthError(error: Error): AppError {
  let message = 'Erreur d\'authentification';
  let status = 401;

  if (error.message.includes('Invalid login credentials')) {
    message = 'Identifiants invalides';
  } else if (error.message.includes('Email not confirmed')) {
    message = 'Email non confirmé';
    status = 403;
  }

  return new AppError(message, 'AUTH_ERROR', status);
}

export function handleValidationError(error: Error): AppError {
  return new AppError(
    'Données invalides',
    'VALIDATION_ERROR',
    400,
    error.message
  );
}