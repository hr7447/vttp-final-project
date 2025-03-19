import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, tap } from 'rxjs';
import { QuoteService } from '../services/quote.service';
import { Quote } from '../models/quote.model';

interface QuoteState {
  quote: Quote | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuoteState = {
  quote: null,
  isLoading: false,
  error: null
};

@Injectable()
export class QuoteStore extends ComponentStore<QuoteState> {
  constructor(private quoteService: QuoteService) {
    super(initialState);
  }

  // Selectors
  readonly quote$ = this.select(state => state.quote);
  readonly isLoading$ = this.select(state => state.isLoading);
  readonly error$ = this.select(state => state.error);

  // Updaters
  readonly setLoading = this.updater((state, isLoading: boolean) => ({
    ...state,
    isLoading,
    error: isLoading ? null : state.error
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error,
    isLoading: false
  }));

  readonly setQuote = this.updater((state, quote: Quote) => ({
    ...state,
    quote,
    isLoading: false
  }));

  // Effects
  readonly loadRandomQuote = this.effect((trigger$: Observable<void>) => {
    return trigger$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() => this.quoteService.getRandomQuote().pipe(
        tap({
          next: (quote) => this.setQuote(quote),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });
} 