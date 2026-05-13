const https = require('https');
const zlib = require('zlib');

function fetchSO(tag, page) {
  // Use a filter that includes answer body. The filter '!*1m*8-(PWm(e_u2z' usually includes answers and body.
  // Actually, we can just use the /search/advanced endpoint with accepted=True.
  // Filter '!bB.J9L(82zP_zU' includes the body of the accepted answer. Let's try custom filter '!*1m*8-(PWm(e_u2z'
  // Let's first just test fetching one question to see the structure.
  const url = `https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${encodeURIComponent(tag)}&site=stackoverflow&pagesize=1&page=${page}&filter=!*1m*8-(PWm(e_u2z`;

  console.log('Fetching', url);
  https.get(url, (res) => {
    let chunks = [];
    res.on('data', d => chunks.push(d));
    res.on('end', () => {
      let buffer = Buffer.concat(chunks);
      if (res.headers['content-encoding'] === 'gzip') {
         buffer = zlib.gunzipSync(buffer);
      }
      const data = JSON.parse(buffer.toString());
      console.log("Quota:", data.quota_remaining);
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        console.log("Title:", item.title);
        if (item.answers && item.answers.length > 0) {
            console.log("Answer length:", item.answers[0].body.length);
        } else {
            console.log("No answers in response");
        }
      } else {
        console.log(data);
      }
    });
  }).on('error', console.error);
}

fetchSO('javascript', 1);
