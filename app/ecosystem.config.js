module.exports = {
  apps : [{
    name   : "AppOpenCNPJ",
    script    : "./main.js",
    instances : "max",
    exec_mode : "cluster"
  }]
}
