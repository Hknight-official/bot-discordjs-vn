
## Yêu cầu
 Install **[NodeJS](https://nodejs.org/en/download/)**

 Install **[ffmpeg](https://www.ffmpeg.org/download.html):** 
 
**Đối với Windows** 
    
Tải về [tại đây](https://ffmpeg.zeranoe.com/builds/), giải nén `ffmpeg.exe` vào thư mục `C:\Windows` hoặc bất kỳ thư mục nào khác rồi thêm vào `PATH`
    
**Đối với Debian**
    
```bash
$ sudo apt install ffmpeg -y
```

**Đối với RedHat**

```bash
$ sudo rpm --import http://li.nux.ro/download/nux/RPM-GPG-KEY-nux.ro

CentOS 6: 
$ sudo rpm -Uvh http://li.nux.ro/download/nux/dextop/el6/x86_64/nux-dextop-release-0-2.el6.nux.noarch.rpm

CentOS 7: 
$ sudo rpm -Uvh http://li.nux.ro/download/nux/dextop/el7/x86_64/nux-dextop-release-0-5.el7.nux.noarch.rpm
    
$ sudo yum install ffmpeg ffmpeg-devel -y
```


**Đối với Mac**
```bash
$ brew install ffmpeg
```

## First Start
```bash
npm i
```

## Config
* Vào đường dẫn: config/config.json điền vào các mục sau: 
```json
{
  "prefix": "COMMAND> ", // Prefix main
  "prefix_child": [
    "!",
	  "&"
  ], // các Prefix phụ  
  "token": "NzE1MjE2NTQwNDEyNDExOTk1.Xs5_Tw.obVT7TbB9tf-GMYvs_2txv15k7Q", // Token bot discord có được sao khi tạo bot trên Settings > Bot > TOKEN
  "id_bot": "715216540412411995", // id của bot lấy được bằng ở mục Settings > Generator Information > CLIENT ID
  "usernameIrc": "hknights", // Tài Khoản Irc Osu! https://old.ppy.sh/p/irc
  "passwordIrc": "c6fa9de0", // Mật Khẩu Irc Osu! https://old.ppy.sh/p/irc
  "apiOsuKey": "f542df9a0b7efc666ac0350446f954740a88faa8" // apikey Osu! https://osu.ppy.sh/p/api
}

```

## Chạy Bot 
```bash
$ npm start
```
## Notes: 
  * Code rất ẩu :v   
