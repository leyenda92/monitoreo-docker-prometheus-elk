const { execSync } = require('child_process')
const http = require('http')

const COMPOSE_FILE = 'docker-compose.monitoring.yml'

function log(title) {
  console.log('\n==============================')
  console.log(title)
  console.log('==============================')
}

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString()
  } catch (e) {
    return e.stdout?.toString() || e.message
  }
}

function request(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode)
    }).on('error', () => resolve(null))
  })
}

(async () => {
  log('TEST STACK MONITOREO COMPLETO')

  console.log('\n1) Verificando contenedores')
  console.log(run(`docker compose -f ${COMPOSE_FILE} ps`))

  console.log('\n2) Probando aplicación /health')
  const health = await request('http://localhost:3000/health')
  console.log('HTTP STATUS:', health)

  console.log('\n3) Probando métricas /metrics')
  console.log(run('curl http://localhost:3000/metrics | head -n 10'))

  console.log('\n4) Generando tráfico')
  for (let i = 0; i < 5; i++) {
    await request('http://localhost:3000/health')
  }
  console.log('Tráfico generado')

  console.log('\n5) Verificando Prometheus (target my-app)')
  const targets = run('curl http://localhost:9090/api/v1/targets')
  console.log(
    targets.includes('my-app')
      ? 'Prometheus OK: target detectado'
      : 'ERROR: Prometheus no detecta la app'
  )

  console.log('\n6) Verificando Elasticsearch')
  const elastic = run('curl http://localhost:9200')
  console.log(
    elastic.includes('cluster_name')
      ? 'Elasticsearch OK'
      : 'ERROR: Elasticsearch no responde'
  )

  console.log('\n7) Verificando índices de logs')
  const indices = run('curl http://localhost:9200/_cat/indices?v')
  console.log(
    indices.includes('app-logs')
      ? 'Índices app-logs-* encontrados'
      : 'WARNING: Aún no hay índices app-logs-*'
  )

  console.log('\n8) Últimos logs de Logstash')
  console.log(run('docker logs --tail 10 monitoreo-docker-prometheus-elk-logstash-1'))

  console.log('\n9) Verificando Alertmanager')
  const alert = await request('http://localhost:9093')
  console.log('HTTP STATUS:', alert)

  log('URLS DE VERIFICACIÓN MANUAL')
  console.log('App:          http://localhost:3000/health')
  console.log('Métricas:     http://localhost:3000/metrics')
  console.log('Prometheus:   http://localhost:9090')
  console.log('Grafana:      http://localhost:3001 (admin / admin123)')
  console.log('Alertmanager: http://localhost:9093')
  console.log('Kibana:       http://localhost:5601')

  log('TEST FINALIZADO')
})()
