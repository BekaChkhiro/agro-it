/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent with multi-language support
 * Stores consent in localStorage to avoid repeat displays
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/contexts/LanguageContext/context';

interface CookieMessage {
  text: string;
  accept: string;
  decline: string;
  learn: string;
}

const messages: Record<Language, CookieMessage> = {
  ka: {
    text: '\u10d4\u10e1 \u10e1\u10d0\u10d8\u10e2\u10d8 \u10d8\u10e7\u10d4\u10dc\u10d4\u10d1\u10e1 \u10e5\u10e3\u10e5\u10d8\u10d4\u10d1\u10e1 \u10e1\u10d0\u10e3\u10d9\u10d4\u10d7\u10d4\u10e1\u10dd \u10db\u10dd\u10db\u10ee\u10db\u10d0\u10e0\u10d4\u10d1\u10da\u10d8\u10e1 \u10d2\u10d0\u10db\u10dd\u10ea\u10d3\u10d8\u10da\u10d4\u10d1\u10d8\u10e1 \u10e3\u10d6\u10e0\u10e3\u10dc\u10d5\u10d4\u10da\u10e1\u10d0\u10e7\u10dd\u10e4\u10d0\u10d3.',
    accept: '\u10db\u10d8\u10e6\u10d4\u10d1\u10d0',
    decline: '\u10e3\u10d0\u10e0\u10e7\u10dd\u10e4\u10d0',
    learn: '\u10d2\u10d0\u10d8\u10d2\u10d4 \u10db\u10d4\u10e2\u10d8'
  },
  en: {
    text: 'This site uses cookies to provide the best user experience.',
    accept: 'Accept',
    decline: 'Decline',
    learn: 'Learn More'
  },
  ru: {
    text: '\u042d\u0442\u043e\u0442 \u0441\u0430\u0439\u0442 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 \u0444\u0430\u0439\u043b\u044b cookie \u0434\u043b\u044f \u043e\u0431\u0435\u0441\u043f\u0435\u0447\u0435\u043d\u0438\u044f \u043d\u0430\u0438\u043b\u0443\u0447\u0448\u0435\u0433\u043e \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u0441\u043a\u043e\u0433\u043e \u043e\u043f\u044b\u0442\u0430.',
    accept: '\u041f\u0440\u0438\u043d\u044f\u0442\u044c',
    decline: '\u041e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c',
    learn: '\u0423\u0437\u043d\u0430\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435'
  },
  hy: {
    text: '\u0531\u0575\u057d \u056f\u0561\u0575\u0584\u0568 \u0585\u0563\u057f\u0561\u0563\u0578\u0580\u056e\u0578\u0582\u0574 \u0567 cookie-\u0576\u0565\u0580\u055d \u056c\u0561\u057e\u0561\u0563\u0578\u0582\u0575\u0576 \u0585\u0563\u057f\u0561\u0563\u0578\u0580\u056e\u0578\u0572\u056b \u0583\u0578\u0580\u0571\u0561\u057c\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576 \u0561\u057a\u0561\u0570\u0578\u057e\u0565\u056c\u0578\u0582 \u0570\u0561\u0574\u0561\u0580.',
    accept: '\u0538\u0576\u0564\u0578\u0582\u0576\u0565\u056c',
    decline: '\u0544\u0565\u0580\u056a\u0565\u056c',
    learn: '\u053b\u0574\u0561\u0576\u0561\u056c \u0561\u057e\u0565\u056c\u056b\u0576'
  }
};

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  const msg = messages[language] || messages.en;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/98 p-4 shadow-strong backdrop-blur-sm"
    >
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-1 items-start gap-3">
          <p className="text-sm text-foreground">
            {msg.text}
            <a
              href="/privacy-policy"
              className="ml-2 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
            >
              {msg.learn}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={decline}>
            {msg.decline}
          </Button>
          <Button size="sm" onClick={accept}>
            {msg.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
