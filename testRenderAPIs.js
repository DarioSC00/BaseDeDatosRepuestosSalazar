const https = require('https');

const RENDER_BASE_URL = 'https://basededatosrepuestossalazar-1.onrender.com';

// Función para hacer requests HTTP
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            url: url
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            url: url,
            error: 'No es JSON válido'
          });
        }
      });
    }).on('error', (error) => {
      reject({
        url: url,
        error: error.message
      });
    });
  });
};

const testRenderAPIs = async () => {
  console.log('🧪 PROBANDO APIs EN RENDER');
  console.log('===========================');
  console.log(`🔗 Base URL: ${RENDER_BASE_URL}\n`);
  
  const endpoints = [
    '/api/health',
    '/api/categorias',
    '/api/productos',
    '/api/usuarios',
    '/api/clientes',
    '/api/proveedores',
    '/api/roles',
    '/api/permissions'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const url = `${RENDER_BASE_URL}${endpoint}`;
    
    try {
      console.log(`🔍 Probando: ${endpoint}`);
      
      const result = await makeRequest(url);
      results.push(result);
      
      if (result.status === 200) {
        const dataLength = Array.isArray(result.data) ? result.data.length : 'N/A';
        console.log(`   ✅ Status: ${result.status} - Datos: ${dataLength} items`);
      } else {
        console.log(`   ⚠️  Status: ${result.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.error}`);
      results.push(error);
    }
    
    // Pequeña pausa para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 RESUMEN DE RESULTADOS:');
  console.log('=========================');
  
  const successful = results.filter(r => r.status === 200);
  const failed = results.filter(r => r.status !== 200 || r.error);
  
  console.log(`✅ APIs funcionando: ${successful.length}/${endpoints.length}`);
  console.log(`❌ APIs con problemas: ${failed.length}/${endpoints.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 APIs FUNCIONANDO:');
    successful.forEach(result => {
      const dataInfo = Array.isArray(result.data) ? `(${result.data.length} items)` : '';
      console.log(`   ✅ ${result.url.replace(RENDER_BASE_URL, '')} ${dataInfo}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n🚨 APIs CON PROBLEMAS:');
    failed.forEach(result => {
      const endpoint = result.url ? result.url.replace(RENDER_BASE_URL, '') : 'Unknown';
      console.log(`   ❌ ${endpoint} - ${result.error || `Status: ${result.status}`}`);
    });
  }
  
  console.log('\n💡 PASOS SIGUIENTES:');
  if (failed.length > 0) {
    console.log('1. Verificar que MONGODB_URI esté configurado en Render');
    console.log('2. Revisar los logs de Render para errores');
    console.log('3. Asegurarse de que el redeploy se completó');
  } else {
    console.log('🎊 ¡Todas las APIs están funcionando correctamente!');
    console.log('🚀 Tu aplicación está lista para usar en producción');
  }
  
  console.log('\n🔗 URLs para probar manualmente:');
  endpoints.forEach(endpoint => {
    console.log(`   ${RENDER_BASE_URL}${endpoint}`);
  });
};

// Ejecutar las pruebas
console.log('⏳ Iniciando pruebas de APIs en Render...\n');
testRenderAPIs().catch(console.error);
