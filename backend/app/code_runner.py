import subprocess
import asyncio
import os
import tempfile

execution_queue = asyncio.Queue()

def run_local_logic(code, language, user_input):
    """Handles Multi-Language Execution natively (No Docker)"""
    
    
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            try:
                formatted_input = user_input if user_input.strip() else "\n"
                if not formatted_input.endswith("\n"):
                    formatted_input += "\n"

                if language == "python":
                    file_path = os.path.join(temp_dir, "main.py")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(code)
                    command = ["python", file_path]
                elif language == "cpp":
                    file_path = os.path.join(temp_dir, "solution.cpp")
                    exe_path = os.path.join(temp_dir, "solution")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(code)
                    comp = subprocess.run(["g++", file_path, "-o", exe_path], capture_output=True, text=True)
                    if comp.returncode != 0:
                        return f"❌ Compiler Error:\n{comp.stderr.strip()}"
                    command = [exe_path]
                elif language == "java":
                    file_path = os.path.join(temp_dir, "Main.java")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(code)
                    comp = subprocess.run(["javac", file_path], capture_output=True, text=True)
                    if comp.returncode != 0:
                        return f"❌ Compiler Error:\n{comp.stderr.strip()}"
                    command = ["java", "-cp", temp_dir, "Main"]
                elif language == "shell":
                    if os.name == "nt":
                        file_path = os.path.join(temp_dir, "script.bat")
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(code)
                        command = [file_path]
                    else:
                        file_path = os.path.join(temp_dir, "script.sh")
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(code)
                        command = ["sh", file_path]
                else:
                    return f"❌ Language '{language}' is not supported yet."

                result = subprocess.run(
                    command,
                    input=formatted_input,
                    capture_output=True,
                    text=True,
                    timeout=15,
                    cwd=temp_dir
                )
                
                if result.returncode == 0:
                    return result.stdout.strip() if result.stdout else "✅ Execution finished (No Output)."
                else:
                    return f"❌ Runtime Error:\n{result.stderr.strip()}"

            except subprocess.TimeoutExpired:
                return "⚠️ Execution Timed Out (Max 15s)."
            except Exception as e:
                return f"❌ System Error: {str(e)}"
    except Exception as outer_e:
      
        return f"⚠️ Execution finished, but cleanup encountered an issue: {str(outer_e)}. This is usually caused by an infinite loop."

async def execution_worker():
    print("👷 Worker is online and waiting for jobs...")
    while True:
        job = await execution_queue.get()
        try:
            loop = asyncio.get_event_loop()
            output = await loop.run_in_executor(None, run_local_logic, job["code"], job["language"], job["input"])
            await job["callback"](output)
        except Exception as e:
            print(f"❌ Worker Error: {e}")
            await job["callback"](f"❌ Worker Error: {str(e)}")
        finally:
            execution_queue.task_done()
