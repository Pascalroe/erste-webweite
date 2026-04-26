import subprocess, os, re
target = '/home/ulf/.openclaw/workspace/fudora_pascal'
print('Target:', repr(target))
print('Files:', sorted(os.listdir(target)))
r = subprocess. run(['git', 'push', 'origin', 'main'], capture_output= True, text= True, cwd= target)
print('Push:', r. returncode) print(r. stdout if r. stdout else '') print(r. stderr if r. stderr else '')