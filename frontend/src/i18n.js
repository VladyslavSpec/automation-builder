const S = {
  // ── Sidebar nav ────────────────────────────────────────────────────────────
  'nav.nodes':     { en: 'Nodes',         ru: 'Ноды',           es: 'Nodos',          de: 'Knoten'         },
  'nav.workflows': { en: 'Workflows',     ru: 'Воркфлоу',       es: 'Flujos',         de: 'Workflows'      },
  'nav.docs':      { en: 'Docs',          ru: 'Инструкция',     es: 'Documentación',  de: 'Anleitung'      },
  'nav.plans':     { en: 'Plans',         ru: 'Планы',          es: 'Planes',         de: 'Pläne'          },
  'nav.settings':  { en: 'Settings',      ru: 'Настройки',      es: 'Ajustes',        de: 'Einstellungen'  },

  // ── Settings ───────────────────────────────────────────────────────────────
  'settings.title':        { en: 'Settings',               ru: 'Настройки',              es: 'Ajustes',               de: 'Einstellungen'          },
  'settings.general':      { en: 'General',                ru: 'Основные',               es: 'General',               de: 'Allgemein'              },
  'settings.integrations': { en: 'Integrations',           ru: 'Интеграции',             es: 'Integraciones',         de: 'Integrationen'          },
  'settings.hotkeys':      { en: 'Hotkeys',                ru: 'Горячие клавиши',        es: 'Atajos',                de: 'Tastenkürzel'           },
  'settings.language':     { en: 'Language',               ru: 'Язык интерфейса',        es: 'Idioma',                de: 'Sprache'                },
  'settings.timezone':     { en: 'Timezone',               ru: 'Часовой пояс',           es: 'Zona horaria',          de: 'Zeitzone'               },
  'settings.dateFormat':   { en: 'Date Format',            ru: 'Формат даты',            es: 'Formato de fecha',      de: 'Datumsformat'           },
  'settings.interface':    { en: 'Interface',              ru: 'Интерфейс',              es: 'Interfaz',              de: 'Oberfläche'             },
  'settings.compact':      { en: 'Compact mode',           ru: 'Компактный режим',       es: 'Modo compacto',         de: 'Kompaktmodus'           },
  'settings.theme':        { en: 'Theme',                  ru: 'Тема',                   es: 'Tema',                  de: 'Thema'                  },
  'settings.themeOnly':    { en: 'Only option',            ru: 'Единственный вариант',   es: 'Única opción',          de: 'Einzige Option'         },
  'settings.dark':         { en: 'Dark',                   ru: 'Тёмная',                 es: 'Oscuro',                de: 'Dunkel'                 },
  'settings.save':         { en: 'Save Preferences',       ru: 'Сохранить настройки',    es: 'Guardar preferencias',  de: 'Einstellungen speichern'},
  'settings.saved':        { en: 'Preferences saved',      ru: 'Настройки сохранены',    es: 'Preferencias guardadas',de: 'Einstellungen gespeichert'},
  'settings.saveKeys':     { en: 'Save Keys',              ru: 'Сохранить ключи',        es: 'Guardar claves',        de: 'Schlüssel speichern'    },
  'settings.saving':       { en: 'Saving...',              ru: 'Сохранение...',          es: 'Guardando...',          de: 'Speichern...'           },
  'settings.keysSaved':    { en: 'Keys saved',             ru: 'Ключи сохранены',        es: 'Claves guardadas',      de: 'Schlüssel gespeichert'  },
  'settings.loading':      { en: 'Loading...',             ru: 'Загрузка...',            es: 'Cargando...',           de: 'Laden...'               },
  'settings.envHint':      { en: 'Use in nodes as',        ru: 'Используй в нодах как',  es: 'Úsalas en nodos como',  de: 'In Knoten verwenden als'},

  // ── Hotkeys ────────────────────────────────────────────────────────────────
  'hk.group.workflow': { en: 'Workflow',  ru: 'Воркфлоу',         es: 'Flujo',        de: 'Workflow'   },
  'hk.group.edit':     { en: 'Edit',      ru: 'Правка',           es: 'Editar',       de: 'Bearbeiten' },
  'hk.group.view':     { en: 'View',      ru: 'Вид',              es: 'Vista',        de: 'Ansicht'    },
  'hk.group.panel':    { en: 'Panel',     ru: 'Панель',           es: 'Panel',        de: 'Panel'      },
  'hk.save':           { en: 'Save workflow',      ru: 'Сохранить воркфлоу',    es: 'Guardar flujo',     de: 'Workflow speichern' },
  'hk.run':            { en: 'Run workflow',       ru: 'Запустить воркфлоу',    es: 'Ejecutar flujo',    de: 'Workflow ausführen' },
  'hk.new':            { en: 'New workflow',       ru: 'Новый воркфлоу',        es: 'Nuevo flujo',       de: 'Neuer Workflow'     },
  'hk.undo':           { en: 'Undo',               ru: 'Отменить',             es: 'Deshacer',          de: 'Rückgängig'         },
  'hk.redo':           { en: 'Redo',               ru: 'Повторить',            es: 'Rehacer',           de: 'Wiederholen'        },
  'hk.selectAll':      { en: 'Select all',         ru: 'Выделить всё',         es: 'Seleccionar todo',  de: 'Alles auswählen'    },
  'hk.copy':           { en: 'Copy selected',      ru: 'Копировать',           es: 'Copiar selección',  de: 'Kopieren'           },
  'hk.paste':          { en: 'Paste',              ru: 'Вставить',             es: 'Pegar',             de: 'Einfügen'           },
  'hk.duplicate':      { en: 'Duplicate',          ru: 'Дублировать',          es: 'Duplicar',          de: 'Duplizieren'        },
  'hk.delete':         { en: 'Delete selected',    ru: 'Удалить выбранное',    es: 'Eliminar selección',de: 'Auswahl löschen'    },
  'hk.center':         { en: 'Center / fit view',  ru: 'По центру',            es: 'Centrar / ajustar', de: 'Zentrieren'         },
  'hk.scroll':         { en: 'Zoom in/out',        ru: 'Масштаб',              es: 'Zoom',              de: 'Zoom'               },
  'hk.pan':            { en: 'Pan canvas',         ru: 'Перемещение холста',   es: 'Mover lienzo',      de: 'Canvas verschieben' },
  'hk.close':          { en: 'Close config panel', ru: 'Закрыть панель',       es: 'Cerrar panel',      de: 'Panel schließen'    },
  'hk.note': {
    en: 'Canvas shortcuts activate only when the canvas is focused. Ctrl+S and Ctrl+↵ work everywhere.',
    ru: 'Горячие клавиши холста работают когда холст в фокусе. Ctrl+S и Ctrl+↵ работают везде.',
    es: 'Los atajos del lienzo se activan cuando está enfocado. Ctrl+S y Ctrl+↵ funcionan en todos lados.',
    de: 'Canvas-Kürzel aktivieren wenn Canvas fokussiert. Ctrl+S und Ctrl+↵ überall.',
  },

  // ── Workflows panel ────────────────────────────────────────────────────────
  'wf.title':     { en: 'My Workflows',              ru: 'Мои воркфлоу',               es: 'Mis flujos',               de: 'Meine Workflows'         },
  'wf.new':       { en: '+ New',                     ru: '+ Новый',                    es: '+ Nuevo',                  de: '+ Neu'                   },
  'wf.search':    { en: 'Search...',                  ru: 'Поиск...',                   es: 'Buscar...',                de: 'Suchen...'               },
  'wf.loading':   { en: 'Loading...',                 ru: 'Загрузка...',                es: 'Cargando...',              de: 'Laden...'                },
  'wf.empty':     { en: 'No workflows yet.',          ru: 'Пока нет воркфлоу.',         es: 'Aún sin flujos.',          de: 'Noch keine Workflows.'   },
  'wf.createNew': { en: 'Click + New to create one.', ru: 'Нажми + Новый для создания.',es: 'Clic en + Nuevo.',         de: 'Klicke + Neu.'           },
  'wf.noResults': { en: 'No results.',                ru: 'Нет результатов.',           es: 'Sin resultados.',          de: 'Keine Ergebnisse.'       },
  'wf.delete':    { en: 'Delete',                    ru: 'Удалить',                    es: 'Eliminar',                 de: 'Löschen'                 },
  'wf.cancel':    { en: 'Cancel',                    ru: 'Отмена',                     es: 'Cancelar',                 de: 'Abbrechen'               },
  'wf.deleteQ':   { en: 'Delete',                    ru: 'Удалить',                    es: 'Eliminar',                 de: 'Löschen'                 },

  // ── Account panel ──────────────────────────────────────────────────────────
  'acc.title':          { en: 'Account',              ru: 'Аккаунт',               es: 'Cuenta',                  de: 'Konto'                   },
  'acc.thisMonth':      { en: 'This month',           ru: 'Этот месяц',            es: 'Este mes',                de: 'Dieser Monat'            },
  'acc.executions':     { en: 'Executions',           ru: 'Запуски',               es: 'Ejecuciones',             de: 'Ausführungen'            },
  'acc.workflows':      { en: 'Workflows',            ru: 'Воркфлоу',              es: 'Flujos',                  de: 'Workflows'               },
  'acc.unlimited':      { en: 'Unlimited',            ru: 'Без ограничений',       es: 'Ilimitado',               de: 'Unbegrenzt'              },
  'acc.displayName':    { en: 'Display Name',         ru: 'Отображаемое имя',      es: 'Nombre visible',          de: 'Anzeigename'             },
  'acc.yourName':       { en: 'Your name',            ru: 'Ваше имя',              es: 'Tu nombre',               de: 'Ihr Name'                },
  'acc.saveName':       { en: 'Save Name',            ru: 'Сохранить имя',         es: 'Guardar nombre',          de: 'Name speichern'          },
  'acc.saving':         { en: 'Saving...',            ru: 'Сохранение...',         es: 'Guardando...',            de: 'Speichern...'            },
  'acc.email':          { en: 'Email',                ru: 'Email',                 es: 'Correo electrónico',      de: 'E-Mail'                  },
  'acc.memberSince':    { en: 'Member since',         ru: 'Участник с',            es: 'Miembro desde',           de: 'Mitglied seit'           },
  'acc.changePassword': { en: 'Change Password',      ru: 'Сменить пароль',        es: 'Cambiar contraseña',      de: 'Passwort ändern'         },
  'acc.currentPw':      { en: 'Current password',     ru: 'Текущий пароль',        es: 'Contraseña actual',       de: 'Aktuelles Passwort'      },
  'acc.newPw':          { en: 'New password (min. 8)',ru: 'Новый пароль (мин. 8)', es: 'Nueva contraseña (mín. 8)',de: 'Neues Passwort (mind. 8)'},
  'acc.updatePw':       { en: 'Update Password',      ru: 'Обновить пароль',       es: 'Actualizar contraseña',   de: 'Passwort aktualisieren'  },
  'acc.updating':       { en: 'Updating...',          ru: 'Обновление...',         es: 'Actualizando...',         de: 'Aktualisieren...'        },
  'acc.signOut':        { en: 'Sign out',             ru: 'Выйти',                es: 'Cerrar sesión',            de: 'Abmelden'                },
  'acc.saved':          { en: 'Saved',                ru: 'Сохранено',             es: 'Guardado',                de: 'Gespeichert'             },
  'acc.failed':         { en: 'Failed',               ru: 'Ошибка',               es: 'Error',                   de: 'Fehler'                  },
  'acc.pwUpdated':      { en: 'Password updated.',    ru: 'Пароль обновлён.',      es: 'Contraseña actualizada.', de: 'Passwort aktualisiert.'  },

  // ── App topbar ─────────────────────────────────────────────────────────────
  'app.save':    { en: 'Save',    ru: 'Сохранить',   es: 'Guardar',    de: 'Speichern' },
  'app.saving':  { en: 'Saving…', ru: 'Сохранение…', es: 'Guardando…', de: 'Speichern…'},
  'app.run':     { en: 'Run',     ru: 'Запуск',      es: 'Ejecutar',   de: 'Ausführen' },
  'app.running': { en: 'Running', ru: 'Выполнение',  es: 'Ejecutando', de: 'Läuft…'   },

  // ── Canvas empty ───────────────────────────────────────────────────────────
  'canvas.start':      { en: 'Start building your workflow',
                         ru: 'Начни строить свой воркфлоу',
                         es: 'Empieza a construir tu flujo',
                         de: 'Starte deinen Workflow'        },
  'canvas.hint':       { en: 'Drag nodes from the left panel onto the canvas, or load a sample workflow to explore.',
                         ru: 'Перетащи ноды из левой панели на холст, или загрузи пример воркфлоу.',
                         es: 'Arrastra nodos al lienzo o carga un flujo de ejemplo.',
                         de: 'Ziehe Knoten auf den Canvas oder lade ein Beispiel-Workflow.'  },
  'canvas.loadSample': { en: 'Load sample workflow', ru: 'Загрузить пример', es: 'Cargar ejemplo', de: 'Beispiel laden' },
  'canvas.sampleDesc': { en: 'YouTube → Claude AI → Twitter + Telegram',
                         ru: 'YouTube → Claude AI → Twitter + Telegram',
                         es: 'YouTube → Claude AI → Twitter + Telegram',
                         de: 'YouTube → Claude AI → Twitter + Telegram' },

  // ── Nodes panel ────────────────────────────────────────────────────────────
  'nodes.library': { en: 'Node Library',   ru: 'Библиотека нод',  es: 'Librería de nodos', de: 'Knotenbibliothek' },
  'nodes.search':  { en: 'Search nodes…',  ru: 'Поиск нод…',      es: 'Buscar nodos…',     de: 'Knoten suchen…'   },

  // ── Docs titles ────────────────────────────────────────────────────────────
  'docs.title':      { en: 'Documentation',      ru: 'Инструкция',           es: 'Documentación',       de: 'Anleitung'            },
  'docs.quickstart': { en: 'Quick Start',         ru: 'Быстрый старт',        es: 'Inicio rápido',       de: 'Schnellstart'         },
  'docs.templates':  { en: 'Template Syntax',     ru: 'Синтаксис шаблонов',   es: 'Sintaxis de plantillas',de: 'Vorlagensyntax'      },
  'docs.nodeRef':    { en: 'Node Reference',      ru: 'Справочник нод',       es: 'Referencia de nodos', de: 'Knotenreferenz'       },
  'docs.webhook':    { en: 'Webhook Setup',       ru: 'Настройка вебхука',    es: 'Configurar webhook',  de: 'Webhook-Setup'        },
  'docs.scheduling': { en: 'Scheduling (Cron)',   ru: 'Расписание (Cron)',    es: 'Programación (Cron)', de: 'Zeitplanung (Cron)'   },
  'docs.faq':        { en: 'FAQ',                 ru: 'Частые вопросы',       es: 'Preguntas frecuentes',de: 'FAQ'                  },

  // ── Time ───────────────────────────────────────────────────────────────────
  'time.justNow': { en: 'just now',  ru: 'только что', es: 'justo ahora', de: 'gerade eben' },
};

export function t(key, lang = 'en') {
  const entry = S[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}

// Returns timeAgo string in given language
export function timeAgo(dateStr, lang = 'en') {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('time.justNow', lang);
  if (mins < 60) {
    const labels = { en: `${mins}m ago`, ru: `${mins} мин назад`, es: `hace ${mins}m`, de: `vor ${mins}m` };
    return labels[lang] || labels.en;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    const labels = { en: `${hrs}h ago`, ru: `${hrs}ч назад`, es: `hace ${hrs}h`, de: `vor ${hrs}h` };
    return labels[lang] || labels.en;
  }
  const days = Math.floor(hrs / 24);
  const labels = { en: `${days}d ago`, ru: `${days}д назад`, es: `hace ${days}d`, de: `vor ${days}d` };
  return labels[lang] || labels.en;
}

export function getLang() {
  try { return JSON.parse(localStorage.getItem('ab_preferences') || '{}').language || 'en'; }
  catch { return 'en'; }
}
