/**
 * Contact: copy-email button and a mailto form.
 * The form never claims to send anything: it checks the fields, then opens
 * the visitor's own email app with the message filled in.
 */
import { SITE } from '../data/site.js';
import { toast } from './fx.js';

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(SITE.email);
    toast('Email copied to clipboard');
  } catch {
    window.location.href = `mailto:${SITE.email}`;
  }
}

export function initContact() {
  document.getElementById('copyEmail')?.addEventListener('click', copyEmail);

  const form = document.getElementById('mailForm');
  if (!form) return;
  const name = form.elements.name;
  const topic = form.elements.topic;
  const msg = form.elements.message;
  const err = document.getElementById('mfError');

  const fail = (field, text) => {
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', 'mfError');
    err.textContent = text;
    err.hidden = false;
    field.focus();
  };
  [name, msg].forEach((f) => f.addEventListener('input', () => {
    f.removeAttribute('aria-invalid');
    if (!form.querySelector('[aria-invalid="true"]')) err.hidden = true;
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!name.value.trim()) return fail(name, 'Please add your name.');
    if (msg.value.trim().length < 10) return fail(msg, 'Please write a short message (at least 10 characters).');
    err.hidden = true;
    const subject = topic.value.trim() || `Hello from ${name.value.trim()}`;
    const bodyText = `${msg.value.trim()}\n\n— ${name.value.trim()}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    toast('Opening your email app…');
  });
}
