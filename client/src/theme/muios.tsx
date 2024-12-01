import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import { grey, red } from "@mui/material/colors";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";

const iOSBoxShadow =
    '0 2px 1px rgba(0,0,0,0.03),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const baseTheme = createTheme({
    palette: {
        primary: {
            main: '#007AFF',
        },
        secondary: {
            main: '#FF3C30',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#F2F1F3',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        body1: {
            fontSize: 18
        },
        body2: {
            fontSize: 12
        }
    },
    components: {
        MuiInputBase: {
            styleOverrides: {
                root: {
                    fontSize: 18
                }
            }
        },        
        MuiTextField: {
            styleOverrides: {
                root: {
                    fontSize: 18
                }
            }
        },
        MuiDialogContentText: {
            styleOverrides: {
                root: {
                    fontSize: 18
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderBottomColor: grey[300],
                }
            }
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                },
            }
        },
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: '400',
                },
            }
        },
        MuiCheckbox: {
            defaultProps: {
                icon: <RadioButtonUnchecked />,
                checkedIcon: <CheckCircle />,
                color: 'primary',
            }
        },
        MuiDialog: {
            defaultProps: {
                PaperProps: {
                    elevation: 0,
                },
            },
            styleOverrides: {
                paper: {
                    margin: 48,
                },
            }
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: 4,
                },
            }
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    paddingBottom: 0,
                },
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    paddingBottom: 0,
                    '& h2': {
                        lineHeight: 'inherit',
                    },
                },
            }
        },
        MuiDivider: {
            styleOverrides: {
                inset: {
                    marginLeft: 16,
                },
            }
        },
        MuiDrawer: {
            defaultProps: {
                PaperProps: {
                    elevation: 0,
                },
            }
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    width: '100%',
                },
            }
        },
        MuiList: {
            styleOverrides: {
                padding: {
                    paddingTop: 0,
                    paddingBottom: 0,
                },
                root: {
                    width: '100%',
                    maxHeight: '100%',
                    overflowY: 'scroll',
                    margin: '16px',
                    borderRadius: '16px',
                    border: '1px solid white',
                }
            }
        },
        MuiListSubheader: {
            styleOverrides: {
                root: {
                    fontSize: 14,
                    textTransform: 'uppercase',
                    lineHeight: '2em',
                    backgroundColor: '#F2F1F3',
                    paddingTop: 24,
                },
            }
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    width: 'auto',
                    gap: 0,
                    borderBottom: `1px solid`,
                    borderBottomColor: grey[300],
                    backgroundColor: 'white',
                    padding: '0px'
                },
            }
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontSize: 16,
                },
            }
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: '#3880ff',
                    height: 2,
                    padding: '15px 0',
                },
                thumb: {
                    height: 23,
                    width: 23,
                    backgroundColor: '#fff',
                    boxShadow: iOSBoxShadow,
                    marginTop: -10,
                    marginLeft: -11,
                    '&:focus, &:hover, &$active': {
                        boxShadow:
                            '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
                        // Reset on touch devices, it doesn't add specificity
                        '@media (hover: none)': {
                            boxShadow: iOSBoxShadow,
                        },
                    },
                    active: {},
                    valueLabel: {
                        left: 'calc(-50% + 12px)',
                        top: -22,
                        '& *': {
                            background: 'transparent',
                            color: '#000',
                        },
                    },
                    track: {
                        height: 3,
                        borderRadius: 1.5,
                        left: '-11px !important',
                    },
                    rail: {
                        height: 3,
                        borderRadius: 1.5,
                        opacity: 0.5,
                        backgroundColor: '#bfbfbf',
                        width: 'calc(100% + 22px)',
                        left: -11,
                    },
                    mark: {
                        backgroundColor: '#bfbfbf',
                        height: 8,
                        width: 1,
                        marginTop: -3,
                    },
                    markActive: {
                        opacity: 1,
                        backgroundColor: 'currentColor',
                    },
                }
            }
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    width: 42,
                    height: 26,
                    padding: 0,
                    margin: 0,
                },
                colorSecondary: {
                    padding: 0,
                    transform: 'translateX(1.5px) translateY(1.5px)',
                    '&$checked': {
                        transform: 'translateX(17px) translateY(1.5px)',
                        color: 'white',
                        '& + $track': {
                            backgroundColor: '#34c859',
                            opacity: 1,
                            border: 'none',
                        },
                    },
                    // '&$focusVisible $thumb': {
                    //   color: '#52d869',
                    //   border: '6px solid #fff',
                    // },
                },
                thumb: {
                    width: 23,
                    height: 23,
                },
                track: {
                    borderRadius: 26 / 2,
                    backgroundColor: grey[200],
                    opacity: 1,
                },
            }
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'white',
                    justifyContent: 'space-between',
                },
            }
        },
        MuiTypography: {
            styleOverrides: {
                subtitle2: {
                    fontWeight: 400,
                    lineHeight: 1.3,
                },
            }
        },
    },
});

const iostheme = deepmerge(baseTheme, {
    overrides: {
        MuiList: {
            root: {
                backgroundColor: baseTheme.palette.background.paper,
            },
        },
        MuiSwitch: {
            track: {
                transition: baseTheme.transitions.create(['background-color', 'border']),
            },
        },
    },
});

export default iostheme;