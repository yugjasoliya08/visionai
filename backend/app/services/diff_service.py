def get_diff(old_text: str, new_text: str):
    old_words = old_text.split()
    new_words = new_text.split()

    added = [word for word in new_words if word not in old_words]
    
    removed = [word for word in old_words if word not in new_words]

    return {
        "added": added,
        "removed": removed
    }