#!/bin/bash
FAIL=0

for file in $(find apps/api/src/routes/admin* -name "*.js"); do
  awk '/router\.(post|put|delete|patch)/{flag=1; route=$0; mut=0; aud=0} 
       flag && /prisma\..*\.(create|update|delete|upsert)/{mut=1} 
       flag && /req\.audit =/{aud=1} 
       flag && /}\);/{ 
         if(mut==1 && aud==0) { 
           print "❌ Missing req.audit in: " route; 
           exit 1; 
         } 
         flag=0 
       }' "$file" || FAIL=1
done

if [ $FAIL -eq 1 ]; then
  echo "❌ CI Check Failed: Mutation found without explicit req.audit metadata."
  exit 1
fi
echo "✅ CI Check Passed: All mutations provide req.audit."
exit 0
