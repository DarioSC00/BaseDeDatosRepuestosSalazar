// Script simple para verificar Render APIs
const https = require('https');

const testURL = (url, description) => {
  return new Promise((resolve) => {
    console.log(`🔍 Probando: ${description}`);
    console.log(`🔗 URL: ${url}`);
    
    const request = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            const count = Array.isArray(jsonData) ? jsonData.length : 'objeto';
            console.log(`✅ ÉXITO: Status ${res.statusCode} - ${count} elementos`);
            if (Array.isArray(jsonData) && jsonData.length > 0) {
              console.log(`📋 Primer elemento: ${jsonData[0].name || jsonData[0].status || 'Ver datos'}`);
            }
          } catch (e) {
            console.log(`✅ ÉXITO: Status ${res.statusCode} - Respuesta: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`⚠️  Status: ${res.statusCode}`);
          console.log(`📄 Respuesta: ${data.substring(0, 200)}...`);
        }
        console.log('─'.repeat(50));
        resolve();
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('─'.repeat(50));
      resolve();
    });
    
    request.setTimeout(10000, () => {
      console.log(`⏰ TIMEOUT: La respuesta tardó más de 10 segundos`);
      request.destroy();
      resolve();
    });
  });
};

const runTests = async () => {
  console.log('🧪 VERIFICACIÓN DE RENDER APIs');
  console.log('================================');
  console.log('');
  
  const tests = [
    {
      url: 'https://basededatosrepuestossalazar-1.onrender.com',
      description: 'Servidor Principal'
    },
    {
      url: 'https://basededatosrepuestossalazar-1.onrender.com/api/health',
      description: 'Health Check (MongoDB)'
    },
    {
      url: 'https://basededatosrepuestossalazar-1.onrender.com/api/categorias',
      description: 'Categorías (debe mostrar 10)'
    },
    {
      url: 'https://basededatosrepuestossalazar-1.onrender.com/api/productos',
      description: 'Productos (debe mostrar 37)'
    }
  ];
  
  for (const test of tests) {
    await testURL(test.url, test.description);
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎯 INSTRUCCIONES:');
  console.log('1. Si ves ✅ ÉXITO en todos, ¡todo funciona!');
  console.log('2. Si ves ⚠️ o ❌, revisa la configuración en Render');
  console.log('3. Si hay TIMEOUT, Render puede estar iniciando');
  console.log('');
  console.log('🔧 URLs para abrir en el navegador:');
  tests.forEach(test => {
    console.log(`   ${test.url}`);
  });
};

runTests();
