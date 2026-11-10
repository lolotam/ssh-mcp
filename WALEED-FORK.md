# Waleed-maintained SSH MCP candidate

Package candidate: `@lolotam/ssh-mcp@2.1.0-waleed.1`. Source base: upstream tufantunc/ssh-mcp commit bd200d31e16de5b87a0b7ae4d4590c07e0c2ad4f, plus the reviewed bounded Docker ps quoted field-format fix. Original MIT license and upstream attribution are retained. The CLI bin stays ssh-mcp.

This is a narrow 2.1.0 backport, not a claim to include later upstream 2.x security or feature work. No global safe-to-read-only promotion. General shell expressions and arbitrary templates remain refused. No production installation or npm publication is implied by this candidate.

Publication, exact Hub package-name transition preview, recovery snapshot/rehearsal and live activation require the owner's separate execution decision. Never patch an existing managed package in place or bypass Hub provenance/approval rules.
