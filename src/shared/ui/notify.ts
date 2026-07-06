export interface NotifyBoxOptions {
  id?: string;
}

/**
 * Cree une petite boite de statut flottante (coin bas-droit) et renvoie une
 * fonction pour mettre a jour son texte. Reutilisable par n'importe quel
 * formulaire.
 */
export function createNotifier(options: NotifyBoxOptions = {}) {
  const id = options.id ?? 'tm-autofill-status';

  return function notify(message: string): void {
    let box = document.getElementById(id);

    if (!box) {
      box = document.createElement('div');
      box.id = id;
      box.style.cssText = [
        'position:fixed',
        'right:16px',
        'bottom:78px',
        'z-index:2147483647',
        'max-width:460px',
        'padding:12px 14px',
        'background:#111827',
        'color:white',
        'border-radius:10px',
        'font:13px/1.35 system-ui,-apple-system,Segoe UI,sans-serif',
        'box-shadow:0 6px 24px rgba(0,0,0,.25)',
      ].join(';');

      document.body.appendChild(box);
    }

    box.textContent = message;
  };
}

export interface AutofillButtonOptions {
  id?: string;
  label?: string;
  onClick: () => void | Promise<void>;
}

/**
 * Installe le bouton flottant "Remplir candidature" (idempotent : ne cree
 * rien si un bouton avec le meme id existe deja).
 */
export function installAutofillButton(options: AutofillButtonOptions): void {
  const id = options.id ?? 'tm-autofill-button';

  if (document.getElementById(id)) return;

  const button = document.createElement('button');
  button.id = id;
  button.type = 'button';
  button.textContent = options.label ?? 'Remplir candidature';
  button.style.cssText = [
    'position:fixed',
    'right:16px',
    'bottom:16px',
    'z-index:2147483647',
    'padding:12px 16px',
    'border-radius:999px',
    'border:0',
    'background:#08698A',
    'color:white',
    'font:600 14px system-ui,-apple-system,Segoe UI,sans-serif',
    'box-shadow:0 6px 20px rgba(0,0,0,.28)',
    'cursor:pointer',
  ].join(';');

  button.addEventListener('click', () => {
    void options.onClick();
  });

  document.body.appendChild(button);
}

/**
 * Les SPA re-render frequemment le DOM (Angular, etc.) et peuvent supprimer
 * le bouton injecte. On le reinstalle a chaque mutation pertinente.
 */
export function observeAndReinstallButton(install: () => void): MutationObserver {
  const observer = new MutationObserver(() => install());

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return observer;
}
