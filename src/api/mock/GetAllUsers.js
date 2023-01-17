function getArray(features) {
  function getRandomNumber(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }

  const maxLength = features.length;
  const lengthOfArray = getRandomNumber(1, maxLength);
  const array = [];

  while (array.length < lengthOfArray) {
    const indexOfEl = getRandomNumber(0, maxLength - 1);
    const el = features[indexOfEl];

    if (!array.includes(el)) {
      array.push(el);
    }
  }
  return array;
}

module.exports = {
  status: 200,
  body: [
    {
      id: 0,
      name: 'Admin',
      surname: 'string',
      patronymic: 'string',
      systemNumber: '381259',
      role: 1,
      hasPassword: true,
      typeClaims: getArray(['0', '1', '2', '3']),
    },
    {
      id: 1,
      name: 'Иван',
      surname: 'Иванов',
      patronymic: 'Иванович',
      systemNumber: '32134',
      role: 4,
      hasPassword: false,
      typeClaims: [],
    },
    {
      id: 2,
      name: 'Петр',
      surname: 'Петров',
      patronymic: 'Петрович',
      systemNumber: '65432',
      role: 4,
      hasPassword: false,
      typeClaims: getArray(['0', '1', '2', '3']),
    },
    {
      id: 5,
      name: 'Антон',
      surname: 'Воронцов',
      patronymic: 'Борисович',
      systemNumber: '63231',
      role: 5,
      hasPassword: false,
      typeClaims: getArray(['0', '1', '2', '3']),
    },
    {
      id: 6,
      name: 'Евгений',
      surname: 'Правилов',
      patronymic: 'Петрович',
      systemNumber: '43221',
      role: 5,
      hasPassword: false,
      typeClaims: getArray(['0', '1', '2', '3']),
    },
    {
      id: 7,
      name: 'Михаил',
      surname: 'Атаманов',
      patronymic: 'Павлович',
      systemNumber: '00001',
      role: 4,
      hasPassword: false,
      typeClaims: [],
    },
    {
      id: 4,
      name: 'Андрей',
      surname: 'Барабанов',
      patronymic: 'Михайлович',
      systemNumber: '42121',
      role: 5,
      hasPassword: false,
      typeClaims: [],
    },
    {
      id: 3,
      name: 'Злата',
      surname: 'Серебрякова',
      patronymic: 'Бронзовна',
      systemNumber: '34311',
      role: 4,
      hasPassword: false,
      typeClaims: [],
    },
    {
      id: 0,
      name: '123',
      surname: '123',
      patronymic: null,
      systemNumber: '550775',
      role: 1,
      hasPassword: true,
      typeClaims: getArray(['0', '1', '2', '3']),
    },
    {
      id: 0,
      name: '123',
      surname: '123',
      patronymic: null,
      systemNumber: '282973',
      role: 4,
      hasPassword: true,
      typeClaims: [],
    },
    {
      id: 0,
      name: '123',
      surname: '123',
      patronymic: null,
      systemNumber: '206014',
      role: 4,
      hasPassword: true,
      typeClaims: [],
    },
    {
      id: 0,
      name: '123',
      surname: '123',
      patronymic: null,
      systemNumber: '16248',
      role: 4,
      hasPassword: true,
      typeClaims: [],
    },
  ],
};
