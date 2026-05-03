import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Card, CreateCardBody, CreateSessionBody, HealthStatus, ListCardsParams, ProgressSummary, ReviewCardBody, Section, Session, StreakData, UpdateCardBody, UpdateSessionBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all MCAT sections
 */
export declare const getListSectionsUrl: () => string;
export declare const listSections: (options?: RequestInit) => Promise<Section[]>;
export declare const getListSectionsQueryKey: () => readonly ["/api/sections"];
export declare const getListSectionsQueryOptions: <TData = Awaited<ReturnType<typeof listSections>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSections>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSections>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSectionsQueryResult = NonNullable<Awaited<ReturnType<typeof listSections>>>;
export type ListSectionsQueryError = ErrorType<unknown>;
/**
 * @summary List all MCAT sections
 */
export declare function useListSections<TData = Awaited<ReturnType<typeof listSections>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSections>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List flashcards with optional filters
 */
export declare const getListCardsUrl: (params?: ListCardsParams) => string;
export declare const listCards: (params?: ListCardsParams, options?: RequestInit) => Promise<Card[]>;
export declare const getListCardsQueryKey: (params?: ListCardsParams) => readonly ["/api/cards", ...ListCardsParams[]];
export declare const getListCardsQueryOptions: <TData = Awaited<ReturnType<typeof listCards>>, TError = ErrorType<unknown>>(params?: ListCardsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCards>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCards>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCardsQueryResult = NonNullable<Awaited<ReturnType<typeof listCards>>>;
export type ListCardsQueryError = ErrorType<unknown>;
/**
 * @summary List flashcards with optional filters
 */
export declare function useListCards<TData = Awaited<ReturnType<typeof listCards>>, TError = ErrorType<unknown>>(params?: ListCardsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCards>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new flashcard
 */
export declare const getCreateCardUrl: () => string;
export declare const createCard: (createCardBody: CreateCardBody, options?: RequestInit) => Promise<Card>;
export declare const getCreateCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
        data: BodyType<CreateCardBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
    data: BodyType<CreateCardBody>;
}, TContext>;
export type CreateCardMutationResult = NonNullable<Awaited<ReturnType<typeof createCard>>>;
export type CreateCardMutationBody = BodyType<CreateCardBody>;
export type CreateCardMutationError = ErrorType<unknown>;
/**
 * @summary Create a new flashcard
 */
export declare const useCreateCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
        data: BodyType<CreateCardBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCard>>, TError, {
    data: BodyType<CreateCardBody>;
}, TContext>;
/**
 * @summary Get a single flashcard
 */
export declare const getGetCardUrl: (id: number) => string;
export declare const getCard: (id: number, options?: RequestInit) => Promise<Card>;
export declare const getGetCardQueryKey: (id: number) => readonly [`/api/cards/${number}`];
export declare const getGetCardQueryOptions: <TData = Awaited<ReturnType<typeof getCard>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCardQueryResult = NonNullable<Awaited<ReturnType<typeof getCard>>>;
export type GetCardQueryError = ErrorType<unknown>;
/**
 * @summary Get a single flashcard
 */
export declare function useGetCard<TData = Awaited<ReturnType<typeof getCard>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a flashcard
 */
export declare const getUpdateCardUrl: (id: number) => string;
export declare const updateCard: (id: number, updateCardBody: UpdateCardBody, options?: RequestInit) => Promise<Card>;
export declare const getUpdateCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
        id: number;
        data: BodyType<UpdateCardBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
    id: number;
    data: BodyType<UpdateCardBody>;
}, TContext>;
export type UpdateCardMutationResult = NonNullable<Awaited<ReturnType<typeof updateCard>>>;
export type UpdateCardMutationBody = BodyType<UpdateCardBody>;
export type UpdateCardMutationError = ErrorType<unknown>;
/**
 * @summary Update a flashcard
 */
export declare const useUpdateCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
        id: number;
        data: BodyType<UpdateCardBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCard>>, TError, {
    id: number;
    data: BodyType<UpdateCardBody>;
}, TContext>;
/**
 * @summary Delete a flashcard
 */
export declare const getDeleteCardUrl: (id: number) => string;
export declare const deleteCard: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
    id: number;
}, TContext>;
export type DeleteCardMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCard>>>;
export type DeleteCardMutationError = ErrorType<unknown>;
/**
 * @summary Delete a flashcard
 */
export declare const useDeleteCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCard>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Mark a card as reviewed (known or unknown)
 */
export declare const getReviewCardUrl: (id: number) => string;
export declare const reviewCard: (id: number, reviewCardBody: ReviewCardBody, options?: RequestInit) => Promise<Card>;
export declare const getReviewCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reviewCard>>, TError, {
        id: number;
        data: BodyType<ReviewCardBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof reviewCard>>, TError, {
    id: number;
    data: BodyType<ReviewCardBody>;
}, TContext>;
export type ReviewCardMutationResult = NonNullable<Awaited<ReturnType<typeof reviewCard>>>;
export type ReviewCardMutationBody = BodyType<ReviewCardBody>;
export type ReviewCardMutationError = ErrorType<unknown>;
/**
 * @summary Mark a card as reviewed (known or unknown)
 */
export declare const useReviewCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reviewCard>>, TError, {
        id: number;
        data: BodyType<ReviewCardBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof reviewCard>>, TError, {
    id: number;
    data: BodyType<ReviewCardBody>;
}, TContext>;
/**
 * @summary List study sessions
 */
export declare const getListSessionsUrl: () => string;
export declare const listSessions: (options?: RequestInit) => Promise<Session[]>;
export declare const getListSessionsQueryKey: () => readonly ["/api/sessions"];
export declare const getListSessionsQueryOptions: <TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof listSessions>>>;
export type ListSessionsQueryError = ErrorType<unknown>;
/**
 * @summary List study sessions
 */
export declare function useListSessions<TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Start a study session
 */
export declare const getCreateSessionUrl: () => string;
export declare const createSession: (createSessionBody: CreateSessionBody, options?: RequestInit) => Promise<Session>;
export declare const getCreateSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSession>>, TError, {
        data: BodyType<CreateSessionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSession>>, TError, {
    data: BodyType<CreateSessionBody>;
}, TContext>;
export type CreateSessionMutationResult = NonNullable<Awaited<ReturnType<typeof createSession>>>;
export type CreateSessionMutationBody = BodyType<CreateSessionBody>;
export type CreateSessionMutationError = ErrorType<unknown>;
/**
 * @summary Start a study session
 */
export declare const useCreateSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSession>>, TError, {
        data: BodyType<CreateSessionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSession>>, TError, {
    data: BodyType<CreateSessionBody>;
}, TContext>;
/**
 * @summary End or update a study session
 */
export declare const getUpdateSessionUrl: (id: number) => string;
export declare const updateSession: (id: number, updateSessionBody: UpdateSessionBody, options?: RequestInit) => Promise<Session>;
export declare const getUpdateSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSession>>, TError, {
        id: number;
        data: BodyType<UpdateSessionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSession>>, TError, {
    id: number;
    data: BodyType<UpdateSessionBody>;
}, TContext>;
export type UpdateSessionMutationResult = NonNullable<Awaited<ReturnType<typeof updateSession>>>;
export type UpdateSessionMutationBody = BodyType<UpdateSessionBody>;
export type UpdateSessionMutationError = ErrorType<unknown>;
/**
 * @summary End or update a study session
 */
export declare const useUpdateSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSession>>, TError, {
        id: number;
        data: BodyType<UpdateSessionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSession>>, TError, {
    id: number;
    data: BodyType<UpdateSessionBody>;
}, TContext>;
/**
 * @summary Get overall study progress summary
 */
export declare const getGetProgressUrl: () => string;
export declare const getProgress: (options?: RequestInit) => Promise<ProgressSummary>;
export declare const getGetProgressQueryKey: () => readonly ["/api/progress"];
export declare const getGetProgressQueryOptions: <TData = Awaited<ReturnType<typeof getProgress>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProgress>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProgress>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProgressQueryResult = NonNullable<Awaited<ReturnType<typeof getProgress>>>;
export type GetProgressQueryError = ErrorType<unknown>;
/**
 * @summary Get overall study progress summary
 */
export declare function useGetProgress<TData = Awaited<ReturnType<typeof getProgress>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProgress>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current study streak and recent activity
 */
export declare const getGetStreakUrl: () => string;
export declare const getStreak: (options?: RequestInit) => Promise<StreakData>;
export declare const getGetStreakQueryKey: () => readonly ["/api/progress/streak"];
export declare const getGetStreakQueryOptions: <TData = Awaited<ReturnType<typeof getStreak>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStreak>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStreak>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStreakQueryResult = NonNullable<Awaited<ReturnType<typeof getStreak>>>;
export type GetStreakQueryError = ErrorType<unknown>;
/**
 * @summary Get current study streak and recent activity
 */
export declare function useGetStreak<TData = Awaited<ReturnType<typeof getStreak>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStreak>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map