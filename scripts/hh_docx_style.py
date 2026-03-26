"""
Healing Hearts DOCX Style Module — Backward-Compatible Wrapper
===============================================================
Delegates to ThemedDocument with the healing-hearts theme.
All existing scripts (build-trisha-review-doc.py, etc.) continue to work.

Usage unchanged:
    from hh_docx_style import HHDocument
    doc = HHDocument()
    doc.title_page("Title", "Subtitle")
    doc.save("output.docx")
"""

import sys
from pathlib import Path

# Add the document-builder plugin's lib to the path
_plugin_lib = Path.home() / ".claude" / "plugins" / "document-builder" / "lib"
if str(_plugin_lib) not in sys.path:
    sys.path.insert(0, str(_plugin_lib))

from themed_document import ThemedDocument


class HHDocument(ThemedDocument):
    """Healing Hearts branded document — delegates to ThemedDocument."""

    def __init__(self, margins=1.0):
        super().__init__(theme="healing-hearts", margins=margins)
