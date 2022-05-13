const routes = {
  '/statistics': {
    importer: () => import('/src/statistics.js'),
    title: 'Рейтинг | Tic Tac Toe',
    styleSheet: '/assets/css/statistics.css'
  },
  '/history': {
    importer: () => import('/src/history.js'),
    title: 'История игр | Tic Tac Toe',
    styleSheet: '/assets/css/history.css'
  },
  '/players': {
    importer: () => import('/src/players.js'),
    title: 'Список игроков | Tic Tac Toe',
    styleSheet: '/assets/css/players.css'
  },
  '/login': {
    importer: () => import('/src/login.js'),
    title: 'Войти в игру | Tic Tac Toe',
    styleSheet: '/assets/css/login.css'
  },
  '/404': {
    importer: () => import('/src/404.js'),
    title: 'Страница не найдена | Tic Tac Toe',
    styleSheet: '/assets/css/404.css'
  },
};
routes['/'] = routes['/statistics'];

const handleRoute = async(location) => {
  const route = routes[location] || routes['/404'];
  const {importer, title, styleSheet} = route;
  if (!document.head.querySelector(`link[href="${styleSheet}"]`)) {
    const cssLink = document.createElement('link');

    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    cssLink.href = styleSheet;

    document.head.append(cssLink);
  }

  document.querySelector('.container').innerHTML = '';
  document.head.querySelector('title').textContent = title;

  if (!route.pageLoader) {
    const {default: loader} = await importer();

    route.pageLoader = loader;
  }

  const {pageLoader} = route;
  const page = await pageLoader(goTo);

  document.querySelector('.container').append(page);
};

const goTo = async(newLocation) => {
  await handleRoute(newLocation);

  history.pushState({}, '', newLocation);
}

const isLoggedIn = async() => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  const response = await fetch(
    '/api/auth/resource',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (response.status >= 400) {
    return false;
  }

  const {login} = await response.json();

  return Boolean(login);
}

window.onload = async() => {
  addEventListener('popstate', async() => {
    await isLoggedIn() ? await handleRoute(location.pathname) : await goTo('/login');
  });

  await isLoggedIn() ? await handleRoute(location.pathname) : await goTo('/login');
};
