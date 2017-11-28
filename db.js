const fs = require('fs');

let data = {
  account: {},
  flow: [],
  command: {},
};

const readLocalFile = () => {
  try {
    fs.statSync('./data.json');
    data.account = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
  } catch(err) {
    fs.openSync('./data.json', 'w');
  }
};

readLocalFile();

const writeFile = () => {
  fs.writeFile('./data.json', JSON.stringify(data.account));
};

const addAccount = (port, password) => {
  if(!data.account[port]) {
    data.account[port] = password;
  }
  return Promise.resolve();
};

const removeAccount = port => {
  delete data.account[port];
  return Promise.resolve();
};

const updateAccount = (port, password) => {
  data.account[port] = password;
  return Promise.resolve();
};

const listAccount = () => {
  return Promise.resolve(Object.keys(data.account).map(k => {
    return {
      port: +k,
      password: data.account[k],
    };
  }));
};

const insertFlow = flow => {
  flow.forEach(f => {
    data.flow.push({
      time: Date.now(),
      port: f.port,
      flow: +f.flow,
    });
  });
  return Promise.resolve();
};

const getFlow = options => {
  writeFile();
  const startTime = options.startTime || 0;
  const endTime = options.endTime || Date.now();
  const accounts = {};
  data.flow.forEach(f => {
    if(f.time >= startTime && f.time <= endTime) {
      if(!accounts.hasOwnProperty(f.port)) {
        accounts[f.port] = 0;
      }
      accounts[f.port] += f.flow;
    }
  });
  if(options.clear) {
    data.flow = data.flow.filter(f => {
      return !!(f.time < startTime || f.time > endTime);
    });
  }
  return Promise.resolve(Object.keys(accounts).map(k => {
    return {
      port: +k,
      sumFlow: accounts[k],
    };
  }));
};

const addCommand = (data, code) => {
  const time = Number.parseInt(data.slice(0, 6).toString('hex'), 16);
  if(data.command[code]) {
    return false;
  }
  data.command[code] = time;
  for(const c in data.command) {
    if(data.command[c] <= Date.now() - 10 * 60 * 1000) {
      delete data.command[c];
    }
  }
  return true;
};

exports.addAccount = addAccount;
exports.removeAccount = removeAccount;
exports.updateAccount = updateAccount;
exports.listAccount = listAccount;
exports.insertFlow = insertFlow;
exports.getFlow = getFlow;
exports.addCommand = addCommand;