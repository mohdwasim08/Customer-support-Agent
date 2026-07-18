The failure mode is now pinned down; I’m reproducing the startup issue directly so I can confirm exactly what needs to change before editing anything.

Read [](file:///Users/mohammadwasim/Desktop/agy-cli-projects/customer-support-agent/tests/unit/test_dummy.py)

Ran terminal command:  uv run python -c "import app.fast_api_app"

The root cause looks consistent: the server import is crashing before the app can even start because it assumes Cloud credentials exist. I’m adjusting that startup path now and adding a regression check.

Replacing 42 lines with 75 lines in [](file:///Users/mohammadwasim/Desktop/agy-cli-projects/customer-support-agent/app/fast_api_app.py), [](file:///Users/mohammadwasim/Desktop/agy-cli-projects/customer-support-agent/tests/unit/test_dummy.py)


```

```

```

```


Ran terminal command:  uv run python -c "import app.fast_api_app; print('import ok')" && uv run pytest tests/unit

The first guard helped, but the library still triggers its own credential check during app creation. I’m switching the telemetry setup to only enable cloud features when credentials are actually available.

Replacing 19 lines with 25 lines in [](file:///Users/mohammadwasim/Desktop/agy-cli-projects/customer-support-agent/app/fast_api_app.py)


```

```


Ran terminal command:  uv run python -c "import app.fast_api_app; print('import ok')" && uv run pytest tests/unit tests/integration/test_agent.py

✅ The startup issue is now fixed.

## What I changed
- Updated fast_api_app.py so the app no longer crashes when Google ADC credentials are missing.
- Added a guard that only enables cloud telemetry when credentials are actually available.
- Kept the `/feedback` endpoint working safely even if logging backends are unavailable.
- Added a regression test in test_dummy.py to verify the server module can still import without ADC.

## Verification
I ran:

```bash
uv run python -c "import app.fast_api_app; print('import ok')" && uv run pytest tests/unit tests/integration/test_agent.py
```

Result:
- `import ok`
- `5 passed`

> I did not rerun the full server E2E suite yet, because the earlier failures were specifically due to credential-dependent startup behavior. The unit and agent-level checks now pass.

If you want, I can next tackle the remaining server E2E tests or improve the workflow prompts themselves.

Made changes.