import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { ChatInputComponent } from './chat-input.component';

describe('ChatInputComponent', () => {
  let component: ChatInputComponent;
  let fixture: ComponentFixture<ChatInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatInputComponent],
      providers: [provideZonelessChangeDetection(), provideTranslateService({ fallbackLang: 'es' })],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ChatInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('canSend computed', () => {
    it('is false when message is empty', () => {
      component.message.set('');
      expect(component.canSend()).toBe(false);
    });

    it('is false when message is only whitespace', () => {
      component.message.set('   ');
      expect(component.canSend()).toBe(false);
    });

    it('is false when message exceeds 500 characters', () => {
      component.message.set('a'.repeat(501));
      expect(component.canSend()).toBe(false);
    });

    it('is false when loading is true', () => {
      component.message.set('Hello');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(component.canSend()).toBe(false);
    });

    it('is true with valid message and loading false', () => {
      component.message.set('Hello');
      expect(component.canSend()).toBe(true);
    });
  });

  describe('characterCount computed', () => {
    it('returns the trimmed message length', () => {
      component.message.set('  Hi  ');
      expect(component.characterCount()).toBe(2);
    });
  });

  describe('onSend()', () => {
    it('emits the trimmed message and clears the input', () => {
      const spy = jest.spyOn(component.send, 'emit');
      component.message.set('  Hello  ');
      component.onSend();
      expect(spy).toHaveBeenCalledWith('Hello');
      expect(component.message()).toBe('');
    });

    it('does not emit when canSend is false (empty message)', () => {
      const spy = jest.spyOn(component.send, 'emit');
      component.message.set('');
      component.onSend();
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not emit when loading is true', () => {
      const spy = jest.spyOn(component.send, 'emit');
      component.message.set('Hello');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      component.onSend();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onKeydown()', () => {
    it('calls onSend when Enter is pressed without Shift', () => {
      const spy = jest.spyOn(component, 'onSend');
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false }));
      expect(spy).toHaveBeenCalled();
    });

    it('does not call onSend when Shift+Enter is pressed', () => {
      const spy = jest.spyOn(component, 'onSend');
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not call onSend for other keys', () => {
      const spy = jest.spyOn(component, 'onSend');
      component.onKeydown(new KeyboardEvent('keydown', { key: 'a' }));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('character counter DOM', () => {
    it('shows counter when message length exceeds 400 characters', () => {
      component.message.set('a'.repeat(401));
      fixture.detectChanges();
      const counter = fixture.nativeElement.querySelector('[data-testid="char-counter"]');
      expect(counter).toBeTruthy();
    });

    it('does not show counter when message length is 400 characters or less', () => {
      component.message.set('Hello');
      fixture.detectChanges();
      const counter = fixture.nativeElement.querySelector('[data-testid="char-counter"]');
      expect(counter).toBeNull();
    });
  });
});
