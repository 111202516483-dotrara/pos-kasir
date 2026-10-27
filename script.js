var API_URL="https://script.google.com/macros/s/AKfycbzO_gUjxK1kzsbfNvezYozWnepDNihcArF-2IvQK3HUelTzAGK0QB5x5DNDs5FiH-ic7Q/exec";
function showLogin(){$("forgotPasswordSection").style.display="none";$("registerSection").style.display="none";$("loginSection").style.display="flex";$("resetAlert").style.display="none"}

function showRegister(){
  $("loginSection").style.display="none";$("registerSection").style.display="flex";$("regAlert").style.display="none"}

function sha256(t){
  return crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)).then(function(b){
    return Array.from(new Uint8Array(b)).map(function(x){return ("0"+x.toString(16)).slice(-2)}).join("")})}

function regMsg(t,ok){var a=$("regAlert");a.className="alert "+(ok?"alert-success":"alert-danger");a.innerText=t;a.style.display="block"}

function handleRegister(e){
  e.preventDefault();
  var f=e.target,u=$("regUser").value.trim().toLowerCase(),p=$("regPass").value,k=$("regCode").value.trim();
  if(!/^[a-z0-9_.]{4,20}$/.test(u))return regMsg("Username 4-20 karakter: huruf, angka, titik, atau _");
  if(p.length<6)return regMsg("Password minimal 6 karakter.");
  if(p!==$("regPass2").value)return regMsg("Ulangi password tidak sama.");
  sha256(u+":"+p).then(function(h){
    return fetch(API_URL+"?action=register&username="+encodeURIComponent(u)+"&hash="+h+"&kode="+encodeURIComponent(k))})
  .then(function(r){return r.json()})
  .then(function(res){
    if(res.status==="success"){regMsg("Akun berhasil dibuat! Silakan masuk.",true);f.reset()}
    else regMsg(res.message||"Gagal membuat akun.")})
  .catch(function(){regMsg("Gagal terhubung ke database.")})}

function handleLogin(e){
  e.preventDefault();
  var u=$("username").value.trim().toLowerCase(),p=$("password").value,al=$("loginAlert");
  sha256(u+":"+p).then(function(h){
    return fetch(API_URL+"?action=login&username="+encodeURIComponent(u)+"&hash="+h)})
  .then(function(r){return r.json()})
  .then(function(res){
    if(res.status==="success"){localStorage.setItem("pos_is_logged_in","true");localStorage.setItem("pos_user",u);showPOS()}
    else{al.innerText=res.message||"Username atau password salah!";al.style.display="block"}})
  .catch(function(){al.innerText="Gagal terhubung ke server.";al.style.display="block"})}


var TYPES=[{id:"Makan di Tempat",up:0},{id:"Bungkus",up:0},{id:"Nasi Kotak",up:0,add:3000},{id:"Go-Food",up:1},{id:"Grab",up:1},{id:"Shopee Food",up:1}];
var MENU=[["kasir","🧾","Kasir"],["riwayat","🕘","Riwayat Penjualan"],["keuangan","💰","Keuangan"],["stok","📦","Stok"],["laporan","📊","Laporan"],["tutup","🚪","Tutup Outlet"],["setting","⚙️","Pengaturan"]];
var FOTO={
  "ayam taliwang":"gambar/taliwang.jpeg",
  "ayam bawang":"gambar/ayam.jpeg",
  "ayam geprek":"gambar/geprek.jpeg",
  "ayam bali":"gambar/ayambali.jpeg",
  "nasi goreng":"gambar/nasgor.jpeg"
};
function fotoProduk(nama){return FOTO[String(nama).toLowerCase().trim()]||""}
function fotoProduk(nama){return FOTO[String(nama).toLowerCase().trim()]||""}
function fotoUrl(s){
  s=String(s||"").trim();
  if(!s)return "";
  if(s.indexOf("drive.google.com")>-1){
    var m=s.match(/\/d\/([\w-]+)/)||s.match(/[?&]id=([\w-]+)/);
    if(m)return "https://drive.google.com/thumbnail?id="+m[1]+"&sz=w400";
  }
  return s;
}


function $(i){return document.getElementById(i)}
function ld(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function sv(k,v){localStorage.setItem(k,JSON.stringify(v))}
function rp(n){return "Rp "+Number(n||0).toLocaleString("id-ID")}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return "&#"+c.charCodeAt(0)+";"})}
function sum(a,f){return a.reduce(function(t,x){return t+f(x)},0)}
function today(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}

var PRODUCTS=[],view="kasir",viewingOld=false;
var settings=ld("pos_set",{nama:"TOKO KASIR POS",alamat:"Jl. Raya Utama No. 123",telp:"0812-3456-7890",markup:25});
var sales=ld("pos_sales",[]),expenses=ld("pos_exp",[]),stock=ld("pos_stock",{}),closed=ld("pos_closed",{});
window.cart=[];window.totalCartAmount=0;window.saleType=TYPES[0];

function price(base){return Math.round(base*(1+(saleType.up?settings.markup/100:0)))+(saleType.add||0)}

function togglePasswordVisibility(){var i=$("password"),ic=$("eyeIcon");
  if(i.type==="password"){i.type="text";ic.innerHTML='<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'}
  else{i.type="password";ic.innerHTML='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'}}
function showForgotPassword(){$("loginSection").style.display="none";$("forgotPasswordSection").style.display="flex";$("loginAlert").style.display="none"}
function showLogin(){$("forgotPasswordSection").style.display="none";$("loginSection").style.display="flex";$("resetAlert").style.display="none"}
function handleResetPassword(e){e.preventDefault();var a=$("resetAlert");a.innerText='Permintaan reset untuk "'+$("resetAccount").value.trim()+'" berhasil dikirim!';a.style.display="block"}
function handleLogout(){localStorage.removeItem("pos_is_logged_in");localStorage.removeItem("pos_user");location.reload()}

function showPOS(){
  $("loginSection").style.display="none";$("forgotPasswordSection").style.display="none";$("posSection").style.display="block";
  var u=localStorage.getItem("pos_user")||"Admin";
  $("loggedUser").innerText=u;$("sbUser").innerText=u;$("avatar").innerText=u.charAt(0).toUpperCase();
  nav("kasir");updateTypeUI();loadProducts()}


function toggleSidebar(){var s=$("sidebar").classList.toggle("open");$("backdrop").style.display=s?"block":"none"}
function nav(v){
 view=v;$("sidebar").classList.remove("open");$("backdrop").style.display="none";
  $("sbStore").innerText=settings.nama;
  $("menuList").innerHTML=MENU.map(function(m){return '<div class="menu-item'+(m[0]===v?" active":"")+'" onclick="nav(\''+m[0]+'\')">'+m[2]+"</div>"}).join("");
  $("pageTitle").innerText=MENU.filter(function(m){return m[0]===v})[0][2];
  $("closedBar").style.display=closed[today()]?"block":"none";
  $("viewKasir").style.display=v==="kasir"?"grid":"none";
  $("viewOther").style.display=v==="kasir"?"none":"block";
  refresh()}
function refresh(){if(view!=="kasir")$("viewOther").innerHTML=R[view]()}


function openTypeModal(){
  $("typeList").innerHTML=TYPES.map(function(t,i){return '<label class="opt"><input type="radio" name="stype" value="'+i+'"'+(t.id===saleType.id?" checked":"")+'><span><b>'+t.id+"</b>"+(t.up?"<small>Semua harga akan di-markup "+settings.markup+"% secara otomatis</small>":"")+(t.add?"<small>Harga per item ditambah "+rp(t.add)+" (biaya dus)</small>":"")+"</span></label>"}).join("");
  $("typeModal").style.display="flex"}
function pickType(){saleType=TYPES[document.querySelector("input[name=stype]:checked").value];$("typeModal").style.display="none";updateTypeUI()}
function updateTypeUI(){$("typeBtn").innerText="Tipe Penjualan: "+saleType.id+" ▾";renderProducts();updateCartUI()}


function loadProducts(){
  fetch(API_URL+"?action=getProducts").then(function(r){return r.json()}).then(function(res){
    if(res.status==="success"&&res.data){
      PRODUCTS=res.data.map(function(p){
        var n=p.Nama||p.NAMA||p.nama||(Array.isArray(p)?p[1]:"Produk");
        var h=p.Harga||p.HARGA||p.harga||(Array.isArray(p)?p[2]:0);
        if(typeof h==="string")h=h.replace(/[^0-9]/g,"");
        return{id:p.Id||p.ID||p.id||(Array.isArray(p)?p[0]:""),nama:n,harga:Number(h)||0,stok:p.Stok,foto:p.Foto||p.FOTO||p.foto||""}});
        PRODUCTS.forEach(function(p){if(p.stok!==undefined&&p.stok!=="")stock[p.nama]=Number(p.stok)});sv("pos_stock",stock);
      renderProducts();refresh()
    }else $("productList").innerHTML="<p>Gagal memuat produk dari database.</p>"
  }).catch(function(){$("productList").innerHTML="<p>Gagal terhubung ke Database.</p>"})}

function renderProducts(){
  var c=$("productList");c.innerHTML="";
  PRODUCTS.forEach(function(p){
    var d=document.createElement("div");d.className="product-card";
    var st=stock[p.nama];
    var f=fotoUrl(p.foto)||fotoProduk(p.nama);   // utamakan foto dari Sheet, cadangan: daftar FOTO

    d.innerHTML=
      (f?'<img class="product-img" src="'+esc(f)+'" alt="'+esc(p.nama)+'" loading="lazy" onerror="this.style.display=\'none\'">':"")+
      '<div class="product-title">'+esc(p.nama)+'</div>'+
      '<div class="product-price">'+rp(price(p.harga))+"</div>"+
      (st!==undefined?'<div class="muted" style="margin:4px 0 0">Stok: '+st+"</div>":"");

    d.onclick=function(){addToCart(p.nama,p.harga)};
    c.appendChild(d)})}
function addToCart(n,h){
  if(closed[today()]){alert("Outlet sudah ditutup. Buka kembali lewat menu Tutup Outlet.");return}
  var it=cart.find(function(i){return i.nama===n}),q=it?it.qty:0;
  if(stock[n]!==undefined&&q+1>stock[n]){alert("Stok "+n+" tidak cukup (sisa "+stock[n]+")");return}
  if(it)it.qty++;else cart.push({nama:n,harga:h,qty:1});
  updateCartUI()}


function removeFromCart(i){
  cart.splice(i, 1);
  updateCartUI();
}

function changeQty(i, d){
  var it = cart[i], n = it.qty + d;
  if(n < 1){ removeFromCart(i); return }
  if(stock[it.nama] !== undefined && n > stock[it.nama]){
    alert("Stok " + it.nama + " tidak cukup (sisa " + stock[it.nama] + ")");
    return;
  }
  it.qty = n;
  updateCartUI();
}


function updateCartUI(){
  var c = $("cartList"), total = 0;
  c.innerHTML = "";


  if(!cart.length){
    c.innerHTML = '<p style="font-size:14px;color:#888">Keranjang masih kosong.</p>';
    $("cartTotal").innerText = "Rp 0";
    totalCartAmount = 0;
    $("btnPay").style.display = "none";
    return;
  }


  cart.forEach(function(i, idx){
    var s = price(i.harga) * i.qty;
    total += s;
    var d = document.createElement("div");
    d.style.cssText = "margin-bottom:8px;font-size:13px;padding-bottom:5px;border-bottom:1px dashed #eee";
    d.innerHTML =
      '<div style="display:flex;justify-content:space-between"><span>' + esc(i.nama) + '</span><strong>' + rp(s) + '</strong></div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-top:4px">' +
        '<button class="qty-btn" onclick="changeQty(' + idx + ',-1)">−</button>' +
        '<span>' + i.qty + '</span>' +
        '<button class="qty-btn" onclick="changeQty(' + idx + ',1)">+</button>' +
        '<a class="lnk" style="margin-left:auto;color:#dc3545" onclick="removeFromCart(' + idx + ')">Hapus</a>' +
      '</div>';
    c.appendChild(d);
  });


  totalCartAmount = total;
  $("cartTotal").innerText = rp(total);
  $("btnPay").style.display = "block";
}

function openPaymentModal(){
  if(closed[today()]){alert("Outlet sudah ditutup.");return}
  $("modalType").innerText="Tipe: "+saleType.id;$("modalTotal").innerText=rp(totalCartAmount);
  $("paymentModal").style.display="flex";$("cashAmount").value="";$("cashChange").innerText="Rp 0";togglePayMethod()}
function closePaymentModal(){$("paymentModal").style.display="none"}
function togglePayMethod(){var c=$("payMethod").value==="CASH";$("cashGroup").style.display=c?"block":"none";$("qrisGroup").style.display=c?"none":"block"}
function calculateChange(){
  var ch=(Number($("cashAmount").value)||0)-totalCartAmount,e=$("cashChange");
  e.innerText=ch<0?"Uang Kurang ("+rp(-ch)+")":rp(ch);e.style.color=ch<0?"#dc3545":"#28a745"}

function processTransaction(){
  function sendToSheet(d){
  var items=d.items.map(function(i){var p=PRODUCTS.filter(function(x){return x.nama===i.nama})[0];return{id:p?p.id:"",qty:i.qty}});
  var q="?action=saveTransaction"+
    "&id="+encodeURIComponent("TRX-"+d.id)+
    "&tanggal="+encodeURIComponent(d.date)+
    "&detail="+encodeURIComponent(d.items.map(function(i){return i.nama+" (x"+i.qty+")"}).join(", "))+
    "&total="+d.total+"&bayar="+d.cash+
    "&tipe="+encodeURIComponent(d.type)+"&metode="+d.method+"&kasir="+encodeURIComponent(d.user)+
    "&items="+encodeURIComponent(JSON.stringify(items));
  fetch(API_URL+q).then(function(r){return r.json()}).then(function(res){if(res.status!=="success")throw 0})
    .catch(function(){alert("Transaksi tersimpan di perangkat ini, tapi gagal dikirim ke Google Sheets.")})}
  var m=$("payMethod").value,paid=totalCartAmount,change=0;
  if(m==="CASH"){paid=Number($("cashAmount").value)||0;
    if(paid<totalCartAmount){alert("Nominal uang tunai kurang dari total belanja!");return}
    change=paid-totalCartAmount}
  var items=cart.map(function(i){return{nama:i.nama,harga:price(i.harga),qty:i.qty}});
  var d={id:Date.now(),day:today(),user:localStorage.getItem("pos_user")||"Admin",date:new Date().toLocaleString("id-ID"),type:saleType.id,method:m,items:items,total:totalCartAmount,cash:paid,change:change};
  sales.push(d);sv("pos_sales",sales);sendToSheet(d);
  items.forEach(function(i){if(stock[i.nama]!==undefined)stock[i.nama]=Math.max(0,stock[i.nama]-i.qty)});sv("pos_stock",stock);
  viewingOld=false;closePaymentModal();showReceiptModal(d)}


function showReceiptModal(d){
  $("rStore").innerText=settings.nama;$("rAddr").innerText=settings.alamat;$("rTelp").innerText="Telp: "+settings.telp;
  $("rDate").innerText=d.date;$("rCashier").innerText=d.user;$("rType").innerText=d.type;$("rMethod").innerText=d.method;
  $("rItems").innerHTML=d.items.map(function(i){return '<div style="margin-bottom:4px"><div>'+esc(i.nama)+'</div><div style="display:flex;justify-content:space-between;color:#555"><span>'+i.qty+" x "+rp(i.harga)+"</span><span>"+rp(i.harga*i.qty)+"</span></div></div>"}).join("");
  $("rTotal").innerText=rp(d.total);
  var c=d.method==="CASH";$("rCashRow").style.display=c?"flex":"none";$("rChangeRow").style.display=c?"flex":"none";
  $("rCash").innerText=rp(d.cash);$("rChange").innerText=rp(d.change);
  $("receiptModal").style.display="flex"}
function closeReceiptModal(){$("receiptModal").style.display="none";if(!viewingOld){cart=[];updateCartUI();renderProducts()}viewingOld=false}
function viewSale(id){viewingOld=true;showReceiptModal(sales.filter(function(s){return s.id===id})[0])}


function card(l,v){return '<div class="card"><small>'+l+"</small><b>"+v+"</b></div>"}
function tbl(t,o,f,byKey){
  var e=Object.keys(o).sort(function(a,b){return byKey?(a<b?1:-1):o[b]-o[a]}).slice(0,10);
  return '<h4 style="margin-top:16px">'+t+'</h4><table class="tbl">'+(e.map(function(k){return "<tr><td>"+esc(k)+"</td><td>"+f(o[k])+"</td></tr>"}).join("")||'<tr><td class="muted">Belum ada data</td></tr>')+"</table>"}
function dsum(){
  var t=sales.filter(function(s){return s.day===today()}),
      ex=expenses.filter(function(e){return e.day===today()}),
      tn=sum(t.filter(function(s){return s.method==="CASH"}),function(s){return s.total}),
      qr=sum(t.filter(function(s){return s.method==="QRIS"}),function(s){return s.total});
  return{t:t,ex:ex,tn:tn,qr:qr,xp:sum(ex,function(e){return e.amt})}}

var R={
  riwayat:function(){
    var s=sales.slice().reverse();
    return "<h3>Riwayat Penjualan</h3>"+(s.length?'<table class="tbl"><tr><th>Waktu</th><th>Tipe</th><th>Metode</th><th>Total</th><th></th></tr>'+s.map(function(x){return "<tr><td>"+x.date+"</td><td>"+x.type+"</td><td>"+x.method+"</td><td>"+rp(x.total)+'</td><td><a class="lnk" onclick="viewSale('+x.id+')">Struk</a></td></tr>'}).join("")+"</table>":'<p class="muted">Belum ada transaksi.</p>')},
  keuangan:function(){
    var d=dsum();
    return "<h3>Keuangan Hari Ini</h3>"+'<div class="cards">'+card("Pemasukan Tunai",rp(d.tn))+card("Pemasukan QRIS",rp(d.qr))+card("Pengeluaran",rp(d.xp))+card("Saldo",rp(d.tn+d.qr-d.xp))+"</div>"+
          '<button class="btn-submit" style="width:auto;margin:0 0 12px;padding:10px 16px;background:#28a745" onclick="showDailyReceipt()">Cetak Resi Penjualan Hari Ini</button>'+  
    '<h4>Catat Pengeluaran</h4><div class="row"><input id="exKet" class="in" placeholder="Keterangan"><input id="exAmt" class="in" type="number" placeholder="Nominal"><button class="btn-submit" style="width:auto;margin:0" onclick="addExpense()">Tambah</button></div>'+
      '<table class="tbl">'+d.ex.map(function(e){return "<tr><td>"+esc(e.ket)+"</td><td>"+rp(e.amt)+'</td><td><a class="lnk" onclick="delExpense('+e.id+')">Hapus</a></td></tr>'}).join("")+"</table>"},
  stok:function(){
  return '<h3>Stok Produk</h3><p class="muted">Kosongkan kolom stok jika produk tidak ingin dilacak. Stok berkurang otomatis saat transaksi selesai.</p><table class="tbl"><tr><th>Produk</th><th>Stok</th><th></th></tr>'+
        (PRODUCTS.map(function(p,i){return "<tr><td>"+esc(p.nama)+'</td><td><input class="in" type="number" min="0" style="width:90px" value="'+(stock[p.nama]===undefined?"":stock[p.nama])+'" onchange="setStock('+i+',this.value)"></td><td><a class="lnk" style="color:#dc3545" onclick="delProduct('+i+')">Hapus</a></td></tr>'}).join("")||'<tr><td class="muted">Produk belum dimuat.</td></tr>')+"</table>"},
  laporan:function(){
    var d={},ty={},pr={};
    sales.forEach(function(s){d[s.day]=(d[s.day]||0)+s.total;ty[s.type]=(ty[s.type]||0)+s.total;s.items.forEach(function(i){pr[i.nama]=(pr[i.nama]||0)+i.qty})});
    return "<h3>Laporan Penjualan</h3>"+'<div class="cards">'+card("Total Penjualan",rp(sum(sales,function(s){return s.total})))+card("Jumlah Transaksi",sales.length)+"</div>"+
      tbl("Per Hari",d,rp,true)+tbl("Per Tipe Penjualan",ty,rp)+tbl("Produk Terlaris",pr,function(v){return v+"x"})},
   tutup:function(){
    var d=dsum(),c=closed[today()];
    return "<h3>Tutup Outlet</h3>"+'<div class="cards">'+card("Transaksi",d.t.length)+card("Tunai",rp(d.tn))+card("QRIS",rp(d.qr))+card("Pengeluaran",rp(d.xp))+card("Kas Tunai Seharusnya",rp(d.tn-d.xp))+"</div>"+
      '<button class="btn-submit" style="background:#28a745" onclick="showDailyReceipt()">Cetak Resi Penjualan Hari Ini</button>'+
      (c?"<p>Outlet ditutup pukul <b>"+c+'</b>.</p><button class="btn-submit" onclick="toggleClose()">Buka Kembali</button>':'<button class="btn-submit" style="background:#dc3545" onclick="toggleClose()">Tutup Outlet Sekarang</button>')},
  setting:function(){
    return '<h3>Pengaturan</h3><div style="max-width:400px"><div class="form-group"><label>Nama Toko</label><input id="sNama" class="in" value="'+esc(settings.nama)+'"></div>'+
      '<div class="form-group"><label>Alamat</label><input id="sAlamat" class="in" value="'+esc(settings.alamat)+'"></div>'+
      '<div class="form-group"><label>Telepon</label><input id="sTelp" class="in" value="'+esc(settings.telp)+'"></div>'+
      '<div class="form-group"><label>Markup Go-Food / Grab / Shoope Food (%)</label><input id="sMarkup" class="in" type="number" min="0" value="'+settings.markup+'"></div>'+
      '<button class="btn-submit" onclick="saveSettings()">Simpan Pengaturan</button></div>'}
};

function addExpense(){
  var k=$("exKet").value.trim(),a=Number($("exAmt").value)||0;
  if(!k||a<=0){alert("Isi keterangan dan nominal pengeluaran.");return}
  expenses.push({id:Date.now(),day:today(),ket:k,amt:a});sv("pos_exp",expenses);refresh()}
function delExpense(id){expenses=expenses.filter(function(e){return e.id!==id});sv("pos_exp",expenses);refresh()}
function setStock(i,v){var n=PRODUCTS[i].nama;if(v==="")delete stock[n];else stock[n]=Math.max(0,Number(v)||0);sv("pos_stock",stock);renderProducts()}
function toggleClose(){
  var t=today();
  if(closed[t]){
    delete closed[t];
    sv("pos_closed",closed);
    nav("tutup");
  }else{
    tmBuka();
  }
}
function saveSettings(){
  settings={nama:$("sNama").value.trim()||"TOKO KASIR POS",alamat:$("sAlamat").value.trim(),telp:$("sTelp").value.trim(),markup:Math.max(0,Number($("sMarkup").value)||0)};
  sv("pos_set",settings);$("sbStore").innerText=settings.nama;updateTypeUI();alert("Pengaturan tersimpan.")}
function showDailyReceipt(){
  var d=dsum(),c=closed[today()],
      line='<div style="border-bottom:1px dashed #000;margin:8px 0"></div>',
      pr={},ty={};
  function row(a,b,bold){return '<div style="display:flex;justify-content:space-between;gap:8px'+(bold?';font-weight:bold':'')+'"><span>'+a+'</span><span>'+b+'</span></div>'}
  d.t.forEach(function(s){
    ty[s.type]=(ty[s.type]||0)+s.total;
    s.items.forEach(function(i){var o=pr[i.nama]||(pr[i.nama]={qty:0,sub:0});o.qty+=i.qty;o.sub+=i.harga*i.qty})});
  var h='<div style="text-align:center"><b style="font-size:15px">'+esc(settings.nama)+'</b>'+
      '<div style="font-size:11px">'+esc(settings.alamat)+'</div><div style="font-size:11px">Telp: '+esc(settings.telp)+'</div></div>'+line+
    '<div style="text-align:center;font-weight:bold">RESI PENJUALAN HARIAN</div>'+line+
    '<div style="font-size:11px"><div>Tanggal : '+new Date().toLocaleDateString("id-ID")+'</div>'+
      '<div>Kasir   : '+esc(localStorage.getItem("pos_user")||"Admin")+'</div>'+
      '<div>Tutup   : '+(c||"Belum ditutup")+'</div></div>'+line+
    '<b>DAFTAR TRANSAKSI</b>'+
    (d.t.map(function(s,n){return row((n+1)+". "+new Date(s.id).toLocaleTimeString("id-ID").slice(0,5)+" "+esc(s.type)+" ("+s.method+")",rp(s.total))}).join("")||"<div>Belum ada transaksi</div>")+line+
    '<b>PRODUK TERJUAL</b>'+
    (Object.keys(pr).map(function(k){return "<div>"+esc(k)+"</div>"+row("&nbsp;&nbsp;"+pr[k].qty+" x",rp(pr[k].sub))}).join("")||"<div>-</div>")+line+
    '<b>PER TIPE PENJUALAN</b>'+
    (Object.keys(ty).map(function(k){return row(esc(k),rp(ty[k]))}).join("")||"<div>-</div>")+line+
    '<b>PENGELUARAN</b>'+
    (d.ex.map(function(e){return row(esc(e.ket),rp(e.amt))}).join("")||"<div>-</div>")+line+
    row("Jumlah Transaksi",d.t.length)+
    row("Penjualan Tunai",rp(d.tn))+
    row("Penjualan QRIS",rp(d.qr))+
    row("TOTAL PENJUALAN",rp(d.tn+d.qr),true)+
    row("Pengeluaran",rp(d.xp))+
    row("Saldo",rp(d.tn+d.qr-d.xp),true)+
    row("Kas Tunai Seharusnya",rp(d.tn-d.xp),true)+line+
    '<div style="text-align:center;font-size:11px;margin-top:8px">*** RESI TUTUP OUTLET ***<br>Dicetak: '+new Date().toLocaleString("id-ID")+'</div>';
  $("dailyPrintArea").innerHTML=h;
  $("dailyModal").style.display="flex"}

function delProduct(i){
  var p=PRODUCTS[i];
  if(!confirm('Hapus produk "'+p.nama+'" dari database? Tindakan ini tidak bisa dibatalkan.'))return;
  fetch(API_URL+"?action=deleteProduct&nama="+encodeURIComponent(p.nama))
    .then(function(r){return r.json()})
    .then(function(res){
      if(res.status==="success"&&res.deleted===true){
        PRODUCTS.splice(i,1);delete stock[p.nama];sv("pos_stock",stock);
        cart=cart.filter(function(c){return c.nama!==p.nama});
        renderProducts();updateCartUI();refresh()
      }else alert("Gagal menghapus: "+(res.message||"server belum mendukung hapus produk"))})
    .catch(function(){alert("Gagal terhubung ke database.")})}


/* =========================================================
   MODAL TUTUP OUTLET (tm*)
   ========================================================= */
function tmAmbilRingkasan(){
  const x = dsum();
  return {
    transaksi: x.t.length,
    tunai: x.tn,
    qris: x.qr,
    pengeluaran: x.xp,
    kasSeharusnya: x.tn - x.xp
  };
}


const tmEl  = id => document.getElementById(id);
const tmRp  = n  => 'Rp ' + Math.abs(n).toLocaleString('id-ID');
const tmRow = (k, v, cls='') => `<div class="tm-row ${cls}"><span>${k}</span><b>${v}</b></div>`;

function tmBarisRingkas(d){
  return tmRow('Transaksi', d.transaksi)
       + tmRow('Tunai', rp(d.tunai))
       + tmRow('QRIS', rp(d.qris))
       + tmRow('Pengeluaran', rp(d.pengeluaran))
       + tmRow('Kas tunai seharusnya', rp(d.kasSeharusnya), 'total');
}

let tmData, tmPemicu;
function tmBuka(){
  tmData   = tmAmbilRingkasan();
  tmPemicu = document.activeElement;
  tmEl('tmTanggal').textContent = new Date().toLocaleDateString('id-ID',
    { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  tmEl('tmRingkas').innerHTML = tmBarisRingkas(tmData);
  tmEl('tmKas').value = '';
  tmHitungSelisih();
  tmEl('tmSheet').dataset.view = 'confirm';
  tmEl('tmOv').classList.add('show');
  tmEl('tmOv').setAttribute('aria-hidden', 'false');
  setTimeout(() => tmEl('tmKas').focus(), 50);
}


function tmTutup(){
  tmEl('tmOv').classList.remove('show');
  tmEl('tmOv').setAttribute('aria-hidden', 'true');
  if (tmPemicu) tmPemicu.focus();
}

function tmHitungSelisih(){
  const input = tmEl('tmKas'), box = tmEl('tmDiff');
  const angka = parseInt(input.value.replace(/\D/g, ''), 10);
  input.value = isNaN(angka) ? '' : angka.toLocaleString('id-ID');
  box.className = 'tm-diff';

  if (isNaN(angka)) {
    box.textContent = 'Isi jumlah uang yang Anda hitung untuk mengecek selisih kas.';
    return;
  }
  const selisih = angka - tmData.kasSeharusnya;
  if (selisih === 0)    { box.classList.add('ok');   box.textContent = 'Kas sesuai, tidak ada selisih.'; }
  else if (selisih < 0) { box.classList.add('less'); box.textContent = 'Kas kurang ' + tmRp(selisih) + ' dari yang seharusnya.'; }
  else                  { box.classList.add('more'); box.textContent = 'Kas lebih ' + tmRp(selisih) + ' dari yang seharusnya.'; }
}
tmEl('tmKas').addEventListener('input', tmHitungSelisih);


function tmProses(){
  const angka = parseInt(tmEl('tmKas').value.replace(/\D/g, ''), 10);
  tmData.kasFisik = isNaN(angka) ? null : angka;
  tmEl('tmSheet').dataset.view = 'process';

  closed[today()] = new Date().toLocaleTimeString('id-ID');
  sv('pos_closed', closed);

  setTimeout(tmSukses, 900);
}


function tmSukses(){
  tmEl('tmStamp').textContent = 'Ditutup pukul ' + closed[today()];

  let html = tmBarisRingkas(tmData);
  if (tmData.kasFisik !== null) {
    const s = tmData.kasFisik - tmData.kasSeharusnya;
    html += tmRow('Uang di laci', rp(tmData.kasFisik))
          + tmRow('Selisih', s === 0 ? 'Sesuai' : (s < 0 ? '-' : '+') + tmRp(s));
  }
  tmEl('tmHasil').innerHTML = html;
  tmEl('tmSheet').dataset.view = 'done';
}
function tmSelesai(){
  tmTutup();
  nav('tutup');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && tmEl('tmSheet').dataset.view === 'confirm') tmTutup();
});
tmEl('tmOv').addEventListener('click', e => {
  if (e.target === tmEl('tmOv') && tmEl('tmSheet').dataset.view === 'confirm') tmTutup();
});
