// Login-Ansicht: E-Mail + Passwort. Gebaut aus den UI-Bausteinen.
import { el } from '../ui/dom.js';
import { card } from '../ui/card.js';
import { input } from '../ui/input.js';
import { button } from '../ui/button.js';
import { signIn } from '../core/auth.js';

// Bausteine liefern autocomplete="off" – fürs Login soll der Passwort-Manager helfen dürfen.
function field(opts, autocomplete) {
  const wrap = input(opts);
  const inp = wrap.querySelector('input');
  inp.setAttribute('autocomplete', autocomplete);
  inp.required = true;
  return { wrap, inp };
}

export function loginView() {
  const email = field({ label: 'E-Mail', type: 'email' }, 'username');
  const password = field({ label: 'Passwort', type: 'password' }, 'current-password');
  const message = el('p', { class: 'app__note app__note--warn', attrs: { role: 'alert' } });
  const submit = button({ text: 'Anmelden', type: 'submit' });

  const form = el('form', { class: 'app__stack', on: { submit: onSubmit } }, [
    email.wrap,
    password.wrap,
    message,
    submit,
  ]);

  async function onSubmit(e) {
    e.preventDefault();
    message.textContent = '';
    submit.disabled = true;
    try {
      await signIn(email.inp.value.trim(), password.inp.value);
      // Bei Erfolg schaltet main.js auf die Startansicht um.
    } catch (err) {
      message.textContent = err.message;
      submit.disabled = false;
    }
  }

  return el('div', { class: 'app' }, [
    el('h1', { class: 'app__title', text: 'System 0' }),
    card({ title: 'Anmelden', children: form }),
  ]);
}
