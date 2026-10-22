(function(){
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const print=()=>window.print();
  $('#printTop')?.addEventListener('click',print);
  $('#printBottom')?.addEventListener('click',print);
  const guide=$('#guideDialog');
  $('#showGuide')?.addEventListener('click',()=>guide?.showModal());
  $('#closeGuide')?.addEventListener('click',()=>guide?.close());
  $('#guidePrint')?.addEventListener('click',()=>{guide?.close();print()});
  // Mirror top metadata into the corresponding printable document fields.
  const mirrorPairs=[['contractNo','docNo'],['contractDate','docDate']];
  mirrorPairs.forEach(([source,target])=>{
    const a=$('[name="'+source+'"]'),b=$('[name="'+target+'"]');
    if(a&&b){a.addEventListener('input',()=>{b.value=a.value});b.addEventListener('input',()=>{a.value=b.value})}
  });
  // Dynamic installment rows.
  const tbody=$('#paymentRows');
  function renumber(){if(!tbody)return;$$('tr',tbody).forEach((tr,i)=>{const cell=tr.querySelector('td');if(cell)cell.textContent=String(i+1).replace(/[0-9]/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]);});}
  function addRow(){
    if(!tbody)return;
    const tr=document.createElement('tr');
    tr.innerHTML='<td></td><td><input name="payStage[]" placeholder="مرحله ساخت"></td><td><input name="payAmount[]" inputmode="numeric" placeholder="مبلغ"></td><td><input name="payDate[]" placeholder="تاریخ"></td><td><input name="payMethod[]" placeholder="رسید / انتقال بانکی"></td><td class="no-print"><button type="button" class="remove-row" aria-label="حذف ردیف">×</button></td>';
    tbody.appendChild(tr);renumber();updateSum();tr.querySelector('input')?.focus();
  }
  $('#addPayment')?.addEventListener('click',addRow);
  tbody?.addEventListener('click',e=>{const b=e.target.closest('.remove-row');if(!b)return;if(tbody.rows.length>1){b.closest('tr').remove();renumber();updateSum()}});
  function digitsToLatin(s){return String(s||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));}
  function moneyNum(s){const n=digitsToLatin(s).replace(/[^0-9]/g,'');return n?Number(n):0}
  function faNum(n){return new Intl.NumberFormat('fa-IR').format(n)}
  function updateSum(){
    const sum=$$('[name="payAmount[]"]',tbody||document).reduce((s,i)=>s+moneyNum(i.value),0);
    const out=$('#paymentSum');if(out)out.textContent='جمع ردیف‌های واردشده: '+faNum(sum)+' ریال';
    const price=$('[name="priceNumber"]');
    if(price&&price.value&&sum>0){out?.classList.toggle('sum-match',sum===moneyNum(price.value));out?.classList.toggle('sum-mismatch',sum!==moneyNum(price.value))}
  }
  tbody?.addEventListener('input',e=>{if(e.target.matches('[name="payAmount[]"]'))updateSum()});
  $('[name="priceNumber"]')?.addEventListener('input',updateSum);
  function clearForm(){
    if(!confirm('تمام اطلاعات واردشده پاک شود؟ این کار قابل بازگشت نیست.'))return;
    $$('input,textarea').forEach(el=>{if(el.type==='checkbox'||el.type==='radio')el.checked=false;else el.value=''});
    updateSum();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  $('#clearForm')?.addEventListener('click',clearForm);
  // Warn if the user attempts to print without completing required party fields.
  window.addEventListener('beforeprint',()=>{
    const required=$$('input[required]');
    required.forEach(el=>{if(!el.value.trim())el.classList.add('print-missing');else el.classList.remove('print-missing')});
  });
  // Avoid accidental Enter submissions and allow long text to remain editable.
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.matches('input:not([type="checkbox"]):not([type="radio"])')&&!e.target.closest('.payment-table'))e.preventDefault();
  });
  renumber();updateSum();
})();