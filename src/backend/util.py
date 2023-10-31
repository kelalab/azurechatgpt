import tiktoken

def num_tokens_from_string(string: str, encoding_name = "cl100k_base") -> int:
    """Helper func: calculate number of tokens
     
       Parameters
       ----------
       string: str  
           input string for which token count is calculated
       encoding_name: str  
           defaults to cl100k_base

    """
    if not string:
        return 0
    # Returns the number of tokens in a text string
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens