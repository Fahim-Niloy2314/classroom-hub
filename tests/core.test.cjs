const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../hub-core.js');
test('24-hour input remains exact; legacy afternoon and explicit AM/PM parse correctly',()=>{
 for(const [value,result] of [['01:30',90],['1:30',810],['13:30',810],['12:00 AM',0],['12:00 PM',720],['6:05 PM',1085],['08:00',480]])assert.equal(C.minutes(value),result);
 for(const value of ['24:01','13:70','nonsense','0:00 PM'])assert.ok(Number.isNaN(C.minutes(value)));
});
test('Unicode calendar lines fit 75 UTF-8 octets and unfold losslessly',()=>{
 const source='SUMMARY:'+('বাংলা মেকানিক্যাল ইঞ্জিনিয়ারিং 😀, '.repeat(30));
 const folded=C.foldIcs(source);
 assert.equal(folded.replace(/\r\n /g,''),source);
 for(const line of folded.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
});
test('calendar computes first weekday from arbitrary term start, Dhaka UTC and exact end',()=>{
 const value=C.calendar({title:'Lab, A; B\nNext',entries:[{id:'one',day:'Thursday',startTime:'13:30',endTime:'16:00',courseCode:'ME-412',courseName:'Test',teacher:'A,B',notes:'বাংলা'}]},'2026-10-20','2027-02-08',new Date('2026-10-20T00:00:00Z'));
 assert.match(value,/DTSTART:20261022T073000Z/);assert.match(value,/DTEND:20261022T100000Z/);assert.match(value,/UNTIL=20270208T175959Z;BYDAY=TH/);assert.match(value,/X-WR-CALNAME:Lab\\, A\\; B\\nNext/);
});
test('calendar rejects invalid dates, missing classes and reversed intervals',()=>{
 const r={entries:[{day:'Tuesday',startTime:'14:00',endTime:'13:00'}]};
 assert.throws(()=>C.calendar(r,'2026-02-30','2026-05-01'));assert.throws(()=>C.calendar(r,'2026-10-20','2026-10-19'));assert.throws(()=>C.calendar(r,'2026-10-20','2027-01-01'));assert.throws(()=>C.calendar({entries:[]},'2026-10-20','2027-01-01'));
});
test('public payload strips private values recursively while preserving intentional empty lists',()=>{
 assert.deepEqual(C.publicValue({faculty:[],settings:{title:'Test',geminiApiKey:'fixture',nested:{password:'fixture',color:'green'}},submissions:[]}),{faculty:[],settings:{title:'Test',nested:{color:'green'}},submissions:[]});
});
test('CV HTML escapes attribute injection and links reject credential-bearing or script URLs',()=>{
 assert.equal(C.html('\"><img src=x onerror=alert(1)>'), '&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
 assert.equal(C.safeUrl('javascript:alert(1)'),'');assert.equal(C.safeUrl('https://secret@example.com'),'');assert.equal(C.safeUrl('github.com/student'),'https://github.com/student');
});
test('corrupt storage falls back without erasing the original saved value',()=>{assert.deepEqual(C.readJSON('{broken','[]'),[]);assert.deepEqual(C.readJSON('{"x":1}','{}'),{x:1});});
