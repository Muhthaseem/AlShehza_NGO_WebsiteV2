import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public/images');
async function walk(dir){
 for(const e of await fs.readdir(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory()) await walk(p);
  else if(/\.(png|jpe?g)$/i.test(p)) await sharp(p).resize({width:1600,withoutEnlargement:true}).webp({quality:84}).toFile(p.replace(/\.(png|jpe?g)$/i,'.webp'));
 }
}
await walk(root);
console.log('Website image derivatives created. Original source images are preserved in the parent workspace.');
