# YHQ Imtihon — B toifa

O'zbekiston haydovchilik guvohnomasi nazariy imtihoniga tayyorgarlik platformasi.
1260 ta rasmiy savol · 63 bilet · uch tilda (lotin / kirill / rus) · 737 ta rasm.

## Ishga tushirish

```
node server.js
```

Keyin brauzerda oching: **http://localhost:5173**

`index.html` ni to'g'ridan-to'g'ri ikki marta bosib ham ochsa bo'ladi — ma'lumot `.js`
fayl sifatida yuklanadi, shuning uchun server shart emas. Lekin server orqali ochish
tavsiya etiladi (rasm keshlash to'g'ri ishlaydi).

## Rejimlar

| Rejim | Tavsif |
|---|---|
| **Imtihon** | Tasodifiy bilet (20 savol), 25 daqiqa, javob qulflanadi, izoh yo'q. 3-xatoda darhol to'xtaydi. |
| **Aralash imtihon** | 1260 savoldan 20 tasi tasodifiy tanlanadi. Eng qiyin rejim. |
| **Biletlar** | 1–63 bilet, o'rgatuvchi rejim: javobdan keyin to'g'ri variant va izoh ko'rsatiladi. |
| **Marafon** | Barcha 1260 savol ketma-ket, to'xtagan joyingiz eslab qolinadi. |
| **Mavzuli mashq** | 20 ta mavzu (belgilar, chorraha, ustunlik, tezlik...). Faqat tanlangan turdagi savollar. |
| **Xatolarim** | Xato qilgan savollaringiz. To'g'ri javob bersangiz ro'yxatdan chiqadi. |

## Imtihon qoidalari (haqiqiy imtihondagidek)

- 20 savol, 25 daqiqa
- 2 tagacha xatoga ruxsat — 3-xatoda imtihon to'xtaydi
- Javob bir marta tanlanadi va qulflanadi, o'zgartirib bo'lmaydi
- Vaqt tugasa avtomatik yakunlanadi

**Navigator ranglari.** Yuqoridagi raqamlar javob berilishi bilan rang oladi:
yashil — to'g'ri, qizil — xato, amber halqa — hozirgi savol, kulrang — javobsiz.
Imtihon rejimida ham shunday: qaysi savolda xato qilganingiz darhol ko'rinadi
(xato hisoblagichi allaqachon buni bildirib turardi). To'g'ri variantning o'zi
va izoh esa faqat yakunda ochiladi.

**Boshlashdan oldin tasdiq so'raladi.** «Imtihon» yoki «Aralash imtihon» bosilganda
«Haqiqatdan boshlamoqchimisiz?» oynasi chiqadi va shartlar ko'rsatiladi. «Yo'q»
bosilsa sessiya umuman yaratilmaydi, taymer ishga tushmaydi. Imtihon davomida
«Chiqish» bosilsa ham tasdiq so'raladi, chunki natija saqlanmaydi.

O'rgatuvchi rejimlarda (bilet, mavzu, marafon) tasdiq so'ralmaydi — u yerda taymer
yo'q va statistika buzilmaydi.

## Telefonga ilova qilib o'rnatish (PWA)

Loyiha PWA qilib sozlangan: telefonga o'rnatiladi, bosh ekranda o'z ikonkasi
bilan turadi, brauzer paneli ko'rinmaydi va **internetsiz ishlaydi**.

### Muhim shart

Service worker faqat **HTTPS** yoki `localhost` da ishlaydi. Ya'ni papkani
telefonga ko'chirib `index.html` ni ochsangiz oflayn ilova bo'lmaydi — saytni
bir joyga joylashtirish kerak. Eng oson bepul variantlar:

| Xizmat | Qanday |
|---|---|
| GitHub Pages | repoga yuklab, Settings → Pages → main branch |
| Netlify | papkani netlify.com/drop ga sudrab tashlash |
| Vercel | `npx vercel --prod` |
| Cloudflare Pages | papkani yuklash |

Joylashtirgach telefonda Chrome bilan oching → menyu → «Ilovani o'rnatish».
iPhone da Safari → «Share» → «Add to Home Screen».

### Rasmlar va oflayn

Ilova qobig'i (HTML, CSS, JS va 1260 savol bazasi) **avtomatik** keshlanadi —
bu ~3,5 MB. Rasmlar esa 63 MB bo'lgani uchun majburlab yuklanmaydi:

- ko'rgan rasmingiz o'z-o'zidan keshga tushadi
- yoki bosh sahifadagi **«Rasmlarni yuklab olish»** tugmasini bosasiz —
  progress ko'rsatkichi bilan hammasi yuklanadi va butunlay oflayn bo'ladi

Kartochkada nechta rasm yuklangani va foizi ko'rinib turadi. «Keshni tozalash»
bilan qaytarib bo'shatsa bo'ladi.

Statistika (imtihonlar, xatolar, mavzu progressi) `localStorage` da — u
internetdan mustaqil, oflaynda ham yoziladi va saqlanadi.

### Fayllar

```
manifest.json         — ilova nomi, ikonkalar, standalone rejim
sw.js                 — service worker (kesh va oflayn mantiq)
js/pwa.js             — o'rnatish tugmasi, progress, oflayn holat
icons/                — 192, 512 va maskable ikonkalar
tools/make-icons.js   — ikonkalarni qayta chizish (node tools/make-icons.js)
```

### Play Store uchun APK

PWA ni haqiqiy APK ga o'rash kerak bo'lsa, eng oson yo'l —
[PWABuilder](https://www.pwabuilder.com): sayt manzilini kiritasiz, u Android
paketini yasab beradi (ichida Trusted Web Activity bo'ladi). Capacitor ham
ishlaydi, lekin bu loyiha uchun ortiqcha murakkablik.

## Ekran maketi

Imtihon va mashq ekranlari **bitta sahifaga sig'adi — sahifa aylanmaydi**.
Rasmli savollarda chapda savol matni va variantlar, o'ngda rasm turadi.

Buning uchun imtihon paytida `<body>` ga `exam-view` klassi qo'shiladi:
sahifa balandligi `100dvh` ga qulflanadi, ichki qismlar flex bilan taqsimlanadi,
rasm `object-fit: contain` orqali qolgan joyga moslashadi. Shrift o'lchamlari
`clamp()` bilan ekran balandligiga qarab biroz kichrayadi.

Bosh sahifa va natija ekranida bu klass olib tashlanadi — u yerda uzun ro'yxat
va savollar tahlili bor, ular odatdagidek aylanadi.

Zaxira holatlar: rasm bilan izoh bir vaqtda bo'lsa, izoh o'ng ustunda o'z ichida
aylanadi (rasm kesilmasligi uchun). Ekran eni 900px dan yoki balandligi 520px dan
kichik bo'lsa ikki ustun tashlanadi — bloklar ustma-ust joylashadi va sahifa
odatdagidek aylanadi, chunki bunday ekranda siqib joylash matnni o'qib bo'lmas
holga keltiradi.

Tekshirildi: 1440x860, 1366x768 va 1280x720 da eng uzun savollarda ham
(683 belgi matn, 1463 belgi izoh bilan) sahifa aylanmadi va variantlar kesilmadi.

## Ikonkalar

Butun interfeysda emoji ishlatilmaydi. `js/icons.js` da 28 ta SVG ikonka bor —
barchasi 24x24 chizmada, `currentColor` bilan bo'yaladi, ya'ni mavzu (qorong'i/yorug')
va holat ranglariga o'zi moslashadi. Tashqi kutubxona yuklanmaydi.

Ikonkalar mavzuga oid: ogohlantiruvchi uchburchak (belgilar), svetofor, teskari
uchburchak (yo'l bering), spidometr (tezlik), doiradagi P (to'xtash), Andrey xochi
(temir yo'l), rul (haydash texnikasi), zanjir bo'g'ini (shatak), sekundomer (imtihon).

Yangi ikonka qo'shish: `js/icons.js` dagi `P` obyektiga `nom: '<path .../>'` qo'shing,
so'ng `Ico.svg('nom', 24)` deb chaqiring. Mavzu ikonkasi `tools/classify.js` dagi
`TOPICS` ro'yxatida `icon` maydoni orqali biriktiriladi.

## Klaviatura

| Tugma | Amal |
|---|---|
| `1` – `4` | Javob tanlash |
| `→` yoki `Enter` | Keyingi savol |
| `←` | Oldingi savol |

## Fayl tuzilishi

```
index.html          — sahifa
css/style.css       — dizayn (qorong'i/yorug' mavzu)
js/app.js           — butun mantiq
js/icons.js         — SVG ikonkalar to'plami (emoji yo'q)
data/questions.js   — 1260 savol, 3 til birlashtirilgan (3.3 MB)
data/topics.js      — savol -> mavzu xaritasi (20 mavzu)
tools/classify.js   — mavzularni qayta hisoblash skripti
images/             — 737 ta .webp rasm (63 MB)
server.js           — mahalliy server
```

### Ma'lumot formati

```js
{
  id: "t_1_q_1",          // global identifikator
  t: 1,                   // bilet raqami
  o: 1,                   // bilet ichidagi tartib
  img: "u1uz.webp",       // rasm (bo'sh bo'lishi mumkin)
  q: { l: "...", c: "...", r: "..." },          // savol: lotin/kirill/rus
  a: [ { l, c, r, ok: 1 }, ... ],               // variantlar, ok=1 to'g'ri
  ex: { l: "...", c: "...", r: "..." }          // izoh
}
```

Statistika brauzerning `localStorage` ida `yhq_b_state_v1` kaliti ostida saqlanadi:
imtihonlar soni, o'tish foizi, xatolar ro'yxati, har bir biletdagi eng yaxshi natija,
marafondagi joy.

## Tekshirilgan

- 63 bilet × 20 savol = 1260, har birida roppa-rosa 1 ta to'g'ri javob
- Uch tilda ham savol, variant va izoh to'liq — yo'qolgan tarjima yo'q
- 3 xato → yiqilish, 2 xato → o'tish (90%), 0 xato → 100%
- Xatolar yig'iladi va to'g'ri javobdan keyin ro'yxatdan chiqadi
- Rasm, taymer, navigator, til almashtirish, mavzu — barchasi ishlaydi

## Mavzular

Baza mavzu bo'yicha bo'linmagan, shuning uchun tasnif `tools/classify.js` orqali
hisoblanadi. Mantiq ikki bosqichli: avval izohdagi YHQ ilova havolasi tekshiriladi
(1-ilova → belgilar, 2-ilova → chiziqlar, 3-ilova → texnik holat), so'ng savol
matnidagi atamalar ustuvorlik tartibida qaraladi.

1260 savolning **1084 tasi** 19 ta aniq mavzuga tushdi, **176 tasi** «Boshqa qoidalar»
da qoldi — bular «Ko'rsatilgan vaziyatda haydovchi qanday yo'l tutishi kerak?» tipidagi,
mazmuni faqat rasmda bo'lgan savollar. Ularni matndan tasniflab bo'lmaydi.

Qoidalarni o'zgartirib, qayta hisoblash:

```
node tools/classify.js
```

Mavzu kartochkasidagi halqa — o'zlashtirish darajasi. Savolga to'g'ri javob bersangiz
hisobga olinadi, keyinroq xato qilsangiz bekor bo'ladi.

## Muhim — saytni ommaga chiqarishdan oldin

`data/questions.js` dagi **`ex` (izoh) maydonlari** avtotestu.uz platformasining
pullik kontentidan olingan. Solishtirish aniq ko'rsatadi: ularning bepul faylida
(`free-uz-lat.json`) 1009 savol bor va **bironta ham izoh yo'q** — `izoh` kaliti
umuman mavjud emas. 41–63-biletlar 20 tadan 9 tagacha qirqilgan. To'liq faylda esa
1260 savol va 1260 ta izoh bor. Savollar matni va rasmlari YHXB ning rasmiy imtihon
bazasi bo'lgani uchun muammo emas, lekin izohlar o'sha platformaning mualliflik
mahsuloti hisoblanadi.

Shaxsiy tayyorgarlik uchun ishlatish muammosiz. Ammo saytni ommaga chiqarsangiz,
izohlarni YHQ matniga (lex.uz/docs/-5953883) tayanib qaytadan yozib chiqing —
bu huquqiy xavfni yo'q qiladi va kontentingizni o'ziga xos qiladi.
"# test-imtihon" 
